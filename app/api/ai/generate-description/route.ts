/**
 * API Route para generar descripciones con IA
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import openai, { MODELS } from '@/lib/ai/openai-client';
import { getDescriptionPrompt } from '@/lib/ai/prompts';

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
    const { tipoTrabajo, imageUrls, context } = body;

    if (!tipoTrabajo) {
      return NextResponse.json({ error: 'tipoTrabajo es requerido' }, { status: 400 });
    }

    // Construir prompt
    const prompt = getDescriptionPrompt(tipoTrabajo, context);

    // Si hay imágenes, usar GPT-4 Vision
    if (imageUrls && imageUrls.length > 0) {
      const messages: any[] = [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            ...imageUrls.slice(0, 5).map((url: string) => ({
              type: 'image_url',
              image_url: { url },
            })),
          ],
        },
      ];

      const completion = await openai.chat.completions.create({
        model: MODELS.GPT4_VISION,
        messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const descripcion = completion.choices[0]?.message?.content;

      return NextResponse.json({
        descripcion,
        model: MODELS.GPT4_VISION,
        tokens: completion.usage,
      });
    } else {
      // Sin imágenes, usar GPT-3.5
      const completion = await openai.chat.completions.create({
        model: MODELS.GPT35_TURBO,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.7,
      });

      const descripcion = completion.choices[0]?.message?.content;

      return NextResponse.json({
        descripcion,
        model: MODELS.GPT35_TURBO,
        tokens: completion.usage,
      });
    }
  } catch (error: any) {
    console.error('Error al generar descripción:', error);
    return NextResponse.json(
      { error: error.message || 'Error al generar descripción' },
      { status: 500 }
    );
  }
}
