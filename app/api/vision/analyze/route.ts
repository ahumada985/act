import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { generarPromptPorTipoEquipo, obtenerChecklistPorTipo, type TipoTrabajo } from '@/lib/ia/prompts'

// Inicializar Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

// Tipos para la respuesta del análisis
export interface AnalisisIA {
  cumplimiento_general: 'CONFORME' | 'NO_CONFORME' | 'PARCIALMENTE_CONFORME'
  puntuacion: number
  items_verificados: Array<{
    item: string
    cumple: boolean
    observacion: string
  }>
  problemas_criticos?: string[]
  recomendaciones: string[]
  equipos_detectados?: Array<{
    tipo: string
    marca?: string
    cantidad: number
    estado: string
  }>
  riesgos_seguridad?: Array<{
    tipo: string
    descripcion: string
    severidad: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA'
  }>
  tipo_antena?: string
  orientacion_estimada?: string
  tipo_instalacion?: string
  alertas_perdida_señal?: string[]
  codigo_colores_detectado?: string[]
  tipo_camara?: string
  cobertura_estimada?: string
  equipos_red_detectados?: Array<{
    tipo: string
    puertos_visibles?: number
    estado: string
  }>
  estado_general?: string
  componentes_requieren_atencion?: string[]
  vida_util_estimada?: string
  observaciones_generales?: string
}

export interface RequestBody {
  imageUrl: string
  tipoEquipo: TipoTrabajo
  checklistItems?: string[]
}

/**
 * POST /api/vision/analyze
 * Analiza una foto de instalación de telecomunicaciones usando Gemini Vision
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar API key
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'API key de Google Gemini no configurada. Agrega GOOGLE_GEMINI_API_KEY a .env.local'
        },
        { status: 500 }
      )
    }

    // Parsear body
    const body: RequestBody = await request.json()
    const { imageUrl, tipoEquipo, checklistItems } = body

    // Validaciones
    if (!imageUrl || !tipoEquipo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Faltan parámetros requeridos: imageUrl y tipoEquipo'
        },
        { status: 400 }
      )
    }

    // Obtener checklist (usar el proporcionado o el por defecto)
    const checklist = checklistItems || obtenerChecklistPorTipo(tipoEquipo)

    // Generar prompt especializado
    const prompt = generarPromptPorTipoEquipo(tipoEquipo, checklist)

    // Obtener modelo Gemini Pro Vision
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Preparar la imagen
    let imagePart: any

    if (imageUrl.startsWith('data:')) {
      // Es una imagen base64
      const base64Data = imageUrl.split(',')[1]
      const mimeType = imageUrl.split(';')[0].split(':')[1]

      imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    } else {
      // Es una URL
      // Gemini puede analizar URLs directamente, pero es mejor convertir a base64
      try {
        const response = await fetch(imageUrl)
        const arrayBuffer = await response.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        const contentType = response.headers.get('content-type') || 'image/jpeg'

        imagePart = {
          inlineData: {
            data: base64,
            mimeType: contentType
          }
        }
      } catch (error) {
        console.error('Error al cargar imagen:', error)
        return NextResponse.json(
          {
            success: false,
            error: 'No se pudo cargar la imagen desde la URL proporcionada'
          },
          { status: 400 }
        )
      }
    }

    // Generar contenido con IA
    const result = await model.generateContent([prompt, imagePart])
    const response = await result.response
    const text = response.text()

    // Intentar parsear el JSON de la respuesta
    let analisisIA: AnalisisIA
    try {
      // Extraer JSON del texto (en caso de que venga con texto adicional)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No se encontró JSON en la respuesta')
      }

      analisisIA = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('Error al parsear respuesta de IA:', parseError)
      console.error('Respuesta original:', text)

      // Devolver error con la respuesta original para debugging
      return NextResponse.json(
        {
          success: false,
          error: 'Error al parsear la respuesta de la IA',
          rawResponse: text
        },
        { status: 500 }
      )
    }

    // Validar campos requeridos
    if (
      typeof analisisIA.cumplimiento_general !== 'string' ||
      typeof analisisIA.puntuacion !== 'number' ||
      !Array.isArray(analisisIA.items_verificados)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'La respuesta de la IA no tiene el formato esperado',
          rawResponse: text
        },
        { status: 500 }
      )
    }

    // Calcular tokens usados (estimación)
    const inputTokensEstimado = Math.ceil((prompt.length + JSON.stringify(imagePart).length) / 4)
    const outputTokensEstimado = Math.ceil(text.length / 4)

    // Costo estimado para Gemini 1.5 Flash
    // Input: $0.00001875 per 1K tokens
    // Output: $0.000075 per 1K tokens
    const costoEstimado = (
      (inputTokensEstimado / 1000) * 0.00001875 +
      (outputTokensEstimado / 1000) * 0.000075
    )

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      analisis: analisisIA,
      metadata: {
        modelo: 'gemini-1.5-flash',
        tipoEquipo,
        timestamp: new Date().toISOString(),
        tokensEstimados: {
          input: inputTokensEstimado,
          output: outputTokensEstimado,
          total: inputTokensEstimado + outputTokensEstimado
        },
        costoEstimadoUSD: costoEstimado.toFixed(6)
      }
    })

  } catch (error: any) {
    console.error('Error en análisis IA:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error interno del servidor al analizar la imagen',
        details: error.toString()
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/vision/analyze
 * Endpoint de prueba para verificar que la API está funcionando
 */
export async function GET() {
  const apiKeyConfigured = !!process.env.GOOGLE_GEMINI_API_KEY

  return NextResponse.json({
    status: 'API Vision Análisis está funcionando',
    apiKeyConfigurada: apiKeyConfigured,
    modeloDisponible: 'gemini-1.5-flash',
    endpoints: {
      POST: '/api/vision/analyze - Analizar imagen',
      GET: '/api/vision/analyze - Estado del servicio'
    },
    ejemplo: {
      method: 'POST',
      body: {
        imageUrl: 'https://example.com/foto.jpg o data:image/jpeg;base64,...',
        tipoEquipo: 'DATA_CENTER | ANTENAS | FIBRA_OPTICA | CCTV | INSTALACION_RED | MANTENIMIENTO | OTRO',
        checklistItems: ['item1', 'item2'] // opcional
      }
    }
  })
}
