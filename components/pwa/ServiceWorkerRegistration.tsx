"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // Función para registrar el Service Worker
      const registerSW = async () => {
        try {
          console.log('[PWA] Checking Service Worker registration...');

          // Verificar si ya hay un SW registrado
          const registration = await navigator.serviceWorker.getRegistration();

          if (registration) {
            console.log('[PWA] Service Worker already registered');

            // Forzar actualización
            registration.update().catch(err => {
              console.warn('[PWA] Update failed:', err);
            });
          } else {
            console.log('[PWA] Registering Service Worker...');

            const reg = await navigator.serviceWorker.register('/sw.js', {
              scope: '/',
            });

            console.log('[PWA] Service Worker registered:', reg);

            // Esperar a que esté activo
            if (reg.installing) {
              console.log('[PWA] Service Worker installing...');
              reg.installing.addEventListener('statechange', (e: any) => {
                console.log('[PWA] SW state:', e.target.state);
              });
            }

            if (reg.waiting) {
              console.log('[PWA] Service Worker waiting, activating...');
              reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            }

            if (reg.active) {
              console.log('[PWA] Service Worker active');
            }

            // Escuchar cambios en el SW
            reg.addEventListener('updatefound', () => {
              console.log('[PWA] Service Worker update found');
              const newWorker = reg.installing;

              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[PWA] New Service Worker available');
                  }
                });
              }
            });
          }

          // Verificar si el SW está controlando la página
          if (navigator.serviceWorker.controller) {
            console.log('[PWA] Page is controlled by Service Worker');
          } else {
            console.log('[PWA] Page NOT controlled by Service Worker');

            // Esperar a que tome control
            navigator.serviceWorker.addEventListener('controllerchange', () => {
              console.log('[PWA] Service Worker now controlling page');
            });
          }

        } catch (error) {
          console.error('[PWA] Service Worker registration failed:', error);
        }
      };

      // Registrar inmediatamente
      registerSW();

      // Re-registrar al hacer focus en la ventana (cuando vuelves a la app)
      const handleFocus = () => {
        console.log('[PWA] App focused, checking SW...');
        registerSW();
      };

      window.addEventListener('focus', handleFocus);

      // Re-registrar cuando se recupera la conexión
      const handleOnline = () => {
        console.log('[PWA] Connection restored, re-registering SW...');
        registerSW();
      };

      window.addEventListener('online', handleOnline);

      return () => {
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('online', handleOnline);
      };
    }
  }, []);

  return null;
}
