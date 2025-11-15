/**
 * Componente de Toaster usando Sonner
 * Notificaciones elegantes y modernas
 */

'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'font-sans',
          title: 'font-semibold',
          description: 'text-sm',
          error: 'border-red-200',
          success: 'border-green-200',
          warning: 'border-yellow-200',
          info: 'border-blue-200',
        },
      }}
    />
  );
}
