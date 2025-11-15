/**
 * API Route para análisis de imágenes con IA
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import openai, { MODELS } from '@/lib/ai/openai-client';
import { getImageAnalysisPrompt } from '@/lib/ai/prompts';

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
    const { tipoTrabajo, imageUrl } = body;

    if (!tipoTrabajo || !imageUrl) {
      return NextResponse.json(
        { error: 'tipoTrabajo e imageUrl son requeridos' },
        { status: 400 }
      );
    }

    const prompt = getImageAnalysisPrompt(tipoTrabajo);

    const completion = await openai.chat.completions.create({
      model: MODELS.GPT4_VISION,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 800,
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const analisisText = completion.choices[0]?.message?.content;
    const analisis = analisisText ? JSON.parse(analisisText) : null;

    return NextResponse.json({
      analisis,
      model: MODELS.GPT4_VISION,
      tokens: completion.usage,
    });
  } catch (error: any) {
    console.error('Error al analizar imagen:', error);
    return NextResponse.json(
      { error: error.message || 'Error al analizar imagen' },
      { status: 500 }
    );
  }
}
