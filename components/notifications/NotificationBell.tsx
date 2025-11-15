/**
 * Componente de campana de notificaciones
 * Muestra notificaciones en tiempo real y permite gestionarlas
 */

'use client';

import { useState } from 'react';
import { Bell, BellOff, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { usePushNotifications } from '@/lib/notifications/usePushNotifications';
import { toast } from 'sonner';

export function NotificationBell() {
  const { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe } =
    usePushNotifications();
  const [open, setOpen] = useState(false);

  if (!isSupported) {
    return null;
  }

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {isSubscribed ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-400" />
          )}
          {isSubscribed && (
            <span className="absolute top-0 right-0 h-2 w-2 bg-green-500 rounded-full" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notificaciones Push</h3>
            <Settings className="h-4 w-4 text-gray-400" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Estado:</span>
              <span
                className={`font-medium ${
                  isSubscribed ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {isSubscribed ? 'Activadas' : 'Desactivadas'}
              </span>
            </div>

            {permission === 'denied' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                Has bloqueado las notificaciones. Para activarlas, debes cambiar los
                permisos en tu navegador.
              </div>
            )}

            {permission === 'default' && !isSubscribed && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                Activa las notificaciones para recibir alertas importantes sobre tus
                reportes y proyectos.
              </div>
            )}

            {isSubscribed && (
              <div className="p-3 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                Recibirás notificaciones sobre:
                <ul className="mt-1 ml-4 list-disc space-y-1">
                  <li>Reportes aprobados/rechazados</li>
                  <li>Nuevos comentarios</li>
                  <li>Proyectos asignados</li>
                  <li>Recordatorios importantes</li>
                </ul>
              </div>
            )}
          </div>

          <Button
            onClick={handleToggleNotifications}
            disabled={isLoading || permission === 'denied'}
            className="w-full"
            variant={isSubscribed ? 'outline' : 'default'}
          >
            {isLoading ? (
              'Procesando...'
            ) : isSubscribed ? (
              <>
                <BellOff className="mr-2 h-4 w-4" />
                Desactivar Notificaciones
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Activar Notificaciones
              </>
            )}
          </Button>

          {permission === 'denied' && (
            <p className="text-xs text-gray-500 text-center">
              Ve a la configuración de tu navegador para permitir notificaciones
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
