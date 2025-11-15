/**
 * API Route para generar observaciones con IA
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import openai, { MODELS } from '@/lib/ai/openai-client';
import { getObservationsPrompt } from '@/lib/ai/prompts';

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
    const { tipoTrabajo, descripcion, analisisIA } = body;

    if (!tipoTrabajo || !descripcion) {
      return NextResponse.json(
        { error: 'tipoTrabajo y descripcion son requeridos' },
        { status: 400 }
      );
    }

    const prompt = getObservationsPrompt(tipoTrabajo, descripcion, analisisIA);

    const completion = await openai.chat.completions.create({
      model: MODELS.GPT35_TURBO,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.7,
    });

    const observaciones = completion.choices[0]?.message?.content;

    return NextResponse.json({
      observaciones,
      model: MODELS.GPT35_TURBO,
      tokens: completion.usage,
    });
  } catch (error: any) {
    console.error('Error al generar observaciones:', error);
    return NextResponse.json(
      { error: error.message || 'Error al generar observaciones' },
      { status: 500 }
    );
  }
}
