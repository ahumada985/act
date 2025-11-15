/**
 * API Route para eliminar suscripciones push
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

    // Eliminar suscripción
    const { error } = await supabase
      .from('PushSubscription')
      .delete()
      .eq('userId', user.id)
      .eq('endpoint', subscription.endpoint);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error al eliminar suscripción:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
