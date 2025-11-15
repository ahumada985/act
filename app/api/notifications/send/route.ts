/**
 * API Route para enviar notificaciones push
 * Solo accesible por ADMIN
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import webpush from 'web-push';

// Configurar VAPID keys
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  privateKey: process.env.VAPID_PRIVATE_KEY!,
};

webpush.setVapidDetails(
  'mailto:tu@email.com', // Cambiar por tu email
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: any;
  userId?: string; // Si se especifica, solo enviar a este usuario
  userIds?: string[]; // O a múltiples usuarios específicos
  sendToAll?: boolean; // O a todos los usuarios
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Verificar autenticación y permisos
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Verificar que sea ADMIN
    const { data: userData } = await supabase
      .from('User')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const payload: NotificationPayload = await request.json();

    // Obtener suscripciones según los criterios
    let query = supabase.from('PushSubscription').select('*');

    if (payload.userId) {
      query = query.eq('userId', payload.userId);
    } else if (payload.userIds && payload.userIds.length > 0) {
      query = query.in('userId', payload.userIds);
    }
    // Si sendToAll es true, no filtramos

    const { data: subscriptions, error } = await query;

    if (error) throw error;

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: 'No hay suscripciones activas' }, { status: 200 });
    }

    // Enviar notificaciones
    const notificationPayload = {
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      data: payload.data || {},
    };

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify(notificationPayload)
        )
      )
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    // Eliminar suscripciones que fallaron con error 410 (Gone)
    const failedSubscriptions = results
      .map((r, index) =>
        r.status === 'rejected' && (r.reason as any)?.statusCode === 410
          ? subscriptions[index]
          : null
      )
      .filter(Boolean);

    if (failedSubscriptions.length > 0) {
      await supabase
        .from('PushSubscription')
        .delete()
        .in(
          'endpoint',
          failedSubscriptions.map((s) => s!.endpoint)
        );
    }

    return NextResponse.json({
      success: true,
      sent: successful,
      failed,
      total: subscriptions.length,
    });
  } catch (error: any) {
    console.error('Error al enviar notificaciones:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
