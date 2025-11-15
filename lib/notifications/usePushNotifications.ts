/**
 * Hook para gestionar notificaciones push
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentSubscription,
} from './push-notifications';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      const supported = isPushSupported();
      setIsSupported(supported);

      if (supported) {
        const perm = await getNotificationPermission();
        setPermission(perm);

        if (perm === 'granted') {
          const sub = await getCurrentSubscription();
          setSubscription(sub);
        }
      }
    };

    checkSupport();
  }, []);

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toast.error('Tu navegador no soporta notificaciones push');
      return;
    }

    setIsLoading(true);

    try {
      // Solicitar permiso
      const perm = await requestNotificationPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        toast.error('Necesitas dar permiso para recibir notificaciones');
        return;
      }

      // Suscribirse
      const sub = await subscribeToPush(VAPID_PUBLIC_KEY);

      if (!sub) {
        throw new Error('No se pudo crear la suscripción');
      }

      setSubscription(sub);

      // Guardar suscripción en el servidor
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });

      if (!response.ok) {
        throw new Error('Error al guardar suscripción en el servidor');
      }

      toast.success('Notificaciones activadas correctamente');
    } catch (error: any) {
      console.error('Error al suscribirse:', error);
      toast.error(error.message || 'Error al activar notificaciones');
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);

    try {
      // Desuscribirse del navegador
      const success = await unsubscribeFromPush();

      if (success) {
        // Notificar al servidor
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription?.toJSON()),
        });

        setSubscription(null);
        toast.success('Notificaciones desactivadas');
      }
    } catch (error) {
      console.error('Error al desuscribirse:', error);
      toast.error('Error al desactivar notificaciones');
    } finally {
      setIsLoading(false);
    }
  }, [subscription]);

  return {
    isSupported,
    permission,
    subscription,
    isSubscribed: !!subscription,
    isLoading,
    subscribe,
    unsubscribe,
  };
}
