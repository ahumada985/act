'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Bot, Sparkles } from 'lucide-react'
import type { AnalisisIA } from '@/app/api/vision/analyze/route'
import type { TipoTrabajo } from '@/lib/ia/prompts'

interface AnalisisIAPanelProps {
  fotoUrl: string
  tipoEquipo: TipoTrabajo
  onAnalisisCompleto?: (analisis: AnalisisIA) => void
  disabled?: boolean
}

export function AnalisisIAPanel({
  fotoUrl,
  tipoEquipo,
  onAnalisisCompleto,
  disabled = false
}: AnalisisIAPanelProps) {
  const [analizando, setAnalizando] = useState(false)
  const [analisis, setAnalisis] = useState<AnalisisIA | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analizarFoto = async () => {
    setAnalizando(true)
    setError(null)

    try {
      const response = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: fotoUrl,
          tipoEquipo: tipoEquipo
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Error al analizar la imagen')
      }

      const analisisData: AnalisisIA = data.analisis

      setAnalisis(analisisData)

      // Callback para guardar el análisis
      if (onAnalisisCompleto) {
        onAnalisisCompleto(analisisData)
      }
    } catch (error: any) {
      console.error('Error al analizar:', error)
      setError(error.message || 'Error desconocido al analizar la imagen')
    } finally {
      setAnalizando(false)
    }
  }

  const getColorPorCumplimiento = (cumplimiento: string) => {
    const colores = {
      CONFORME: 'bg-green-100 text-green-800 border-green-300',
      NO_CONFORME: 'bg-red-100 text-red-800 border-red-300',
      PARCIALMENTE_CONFORME: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    }
    return colores[cumplimiento as keyof typeof colores] || colores.PARCIALMENTE_CONFORME
  }

  const getColorPorPuntuacion = (puntuacion: number) => {
    if (puntuacion >= 80) return 'text-green-600'
    if (puntuacion >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSeveridadColor = (severidad: string) => {
    const colores = {
      CRITICA: 'bg-red-100 text-red-800 border-red-300',
      ALTA: 'bg-orange-100 text-orange-800 border-orange-300',
      MEDIA: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      BAJA: 'bg-blue-100 text-blue-800 border-blue-300'
    }
    return colores[severidad as keyof typeof colores] || colores.MEDIA
  }

  return (
    <div className="space-y-4">
      {/* Botón de Análisis */}
      <div className="flex gap-3">
        <Button
          onClick={analizarFoto}
          disabled={analizando || disabled || !fotoUrl}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="lg"
        >
          {analizando ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analizando con IA...
            </>
          ) : (
            <>
              <Bot className="mr-2 h-5 w-5" />
              Analizar con IA
              <Sparkles className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Info */}
      {!analisis && !error && (
        <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span>
              La IA analizará la foto y verificará automáticamente el cumplimiento de estándares de instalación.
            </span>
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Error al analizar</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      {analisis && (
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Análisis de Conformidad IA</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Powered by Gemini Vision AI
                </p>
              </div>
              <div className="text-center">
                <div className={`text-5xl font-bold ${getColorPorPuntuacion(analisis.puntuacion)}`}>
                  {analisis.puntuacion}
                </div>
                <div className="text-sm text-muted-foreground">de 100</div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Badge de Estado General */}
            <div>
              <Badge
                className={`text-base px-4 py-2 ${getColorPorCumplimiento(analisis.cumplimiento_general)}`}
              >
                {analisis.cumplimiento_general.replace(/_/g, ' ')}
              </Badge>
            </div>

            {/* Items Verificados */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                Checklist de Verificación ({analisis.items_verificados.length} items)
              </h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {analisis.items_verificados.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    {item.cumple ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${item.cumple ? 'text-green-800' : 'text-red-800'}`}>
                        {item.item}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{item.observacion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Problemas Críticos */}
            {analisis.problemas_criticos && analisis.problemas_criticos.length > 0 && (
              <div className="border-2 border-red-300 rounded-lg p-4 bg-red-50">
                <h4 className="font-semibold mb-3 text-red-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Problemas Críticos ({analisis.problemas_criticos.length})
                </h4>
                <ul className="space-y-2">
                  {analisis.problemas_criticos.map((problema, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span className="text-sm text-red-900 font-medium">{problema}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Riesgos de Seguridad */}
            {analisis.riesgos_seguridad && analisis.riesgos_seguridad.length > 0 && (
              <div className="border-2 border-orange-300 rounded-lg p-4 bg-orange-50">
                <h4 className="font-semibold mb-3 text-orange-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Riesgos de Seguridad Detectados
                </h4>
                <div className="space-y-3">
                  {analisis.riesgos_seguridad.map((riesgo, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 border border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-orange-900">{riesgo.tipo}</span>
                        <Badge className={getSeveridadColor(riesgo.severidad)}>
                          {riesgo.severidad}
                        </Badge>
                      </div>
                      <p className="text-sm text-orange-800">{riesgo.descripcion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Equipos Detectados */}
            {analisis.equipos_detectados && analisis.equipos_detectados.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Equipos Detectados ({analisis.equipos_detectados.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analisis.equipos_detectados.map((equipo, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-card">
                      <p className="font-medium">{equipo.tipo}</p>
                      {equipo.marca && (
                        <p className="text-sm text-muted-foreground">{equipo.marca}</p>
                      )}
                      <p className="text-xs mt-1">
                        Cantidad: {equipo.cantidad} • {equipo.estado}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Equipos de Red Detectados */}
            {analisis.equipos_red_detectados && analisis.equipos_red_detectados.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Equipos de Red Detectados</h4>
                <div className="space-y-2">
                  {analisis.equipos_red_detectados.map((equipo, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-card">
                      <p className="font-medium">{equipo.tipo}</p>
                      {equipo.puertos_visibles && (
                        <p className="text-sm text-muted-foreground">Puertos visibles: {equipo.puertos_visibles}</p>
                      )}
                      <p className="text-xs mt-1">{equipo.estado}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Adicional (tipo específico) */}
            {(analisis.tipo_antena || analisis.tipo_camara || analisis.tipo_instalacion) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Información Adicional</h4>
                <div className="space-y-1 text-sm">
                  {analisis.tipo_antena && (
                    <p><span className="font-medium">Tipo de Antena:</span> {analisis.tipo_antena}</p>
                  )}
                  {analisis.orientacion_estimada && (
                    <p><span className="font-medium">Orientación:</span> {analisis.orientacion_estimada}</p>
                  )}
                  {analisis.tipo_camara && (
                    <p><span className="font-medium">Tipo de Cámara:</span> {analisis.tipo_camara}</p>
                  )}
                  {analisis.cobertura_estimada && (
                    <p><span className="font-medium">Cobertura:</span> {analisis.cobertura_estimada}</p>
                  )}
                  {analisis.tipo_instalacion && (
                    <p><span className="font-medium">Tipo de Instalación:</span> {analisis.tipo_instalacion}</p>
                  )}
                  {analisis.estado_general && (
                    <p><span className="font-medium">Estado General:</span> {analisis.estado_general}</p>
                  )}
                </div>
              </div>
            )}

            {/* Recomendaciones */}
            {analisis.recomendaciones && analisis.recomendaciones.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Recomendaciones ({analisis.recomendaciones.length})
                </h4>
                <ul className="space-y-2">
                  {analisis.recomendaciones.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 p-2 rounded bg-blue-50">
                      <span className="text-blue-600">→</span>
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
