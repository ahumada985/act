/**
 * API Route para extraer texto con OCR (server-side con Sharp)
 * Alternativa para procesamiento pesado en servidor
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Verificar autenticación
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl, type } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl es requerido' }, { status: 400 });
    }

    // Nota: El OCR pesado se puede hacer en el cliente con Tesseract.js
    // Esta ruta está preparada para integración con Google Cloud Vision API
    // o AWS Textract para mayor precisión

    // Por ahora, retornamos un mensaje para usar OCR en cliente
    return NextResponse.json({
      message: 'Usa extractTextFromImage() en el cliente con Tesseract.js',
      clientSide: true,
    });
  } catch (error: any) {
    console.error('Error en OCR:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar OCR' },
      { status: 500 }
    );
  }
}
