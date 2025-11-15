/**
 * API Route para guardar suscripciones push
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

    const subscription = await request.json();

    // Guardar suscripción en la tabla PushSubscription
    const { error } = await supabase.from('PushSubscription').upsert({
      userId: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      updatedAt: new Date().toISOString(),
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error al guardar suscripción:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
