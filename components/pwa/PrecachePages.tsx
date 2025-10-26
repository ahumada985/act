"use client";

import { useEffect } from "react";

export function PrecachePages() {
  useEffect(() => {
    // Solo ejecutar en producción y si es una PWA instalada
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'development') {
      return;
    }

    // Detectar si la app está instalada como PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (!isStandalone) {
      return; // Solo pre-cachear si es PWA instalada
    }

    // Lista de URLs críticas para pre-cachear
    const criticalUrls = [
      '/',
      '/offline',
      '/dashboard',
      '/reportes',
      '/proyectos',
      '/mapa',
      '/galeria',
    ];

    // Pre-cachear páginas en segundo plano
    const precachePages = async () => {
      try {
        const cache = await caches.open('precache-v2');

        // Verificar qué URLs ya están en caché
        const cachedRequests = await cache.keys();
        const cachedUrls = cachedRequests.map(req => new URL(req.url).pathname);

        // Solo cachear las que faltan
        const urlsToCache = criticalUrls.filter(url => !cachedUrls.includes(url));

        if (urlsToCache.length > 0) {
          console.log('[PWA] Pre-cacheando páginas:', urlsToCache);

          // Hacer fetch de cada URL para que el service worker la cachee
          await Promise.all(
            urlsToCache.map(url =>
              fetch(url, {
                credentials: 'same-origin',
                cache: 'no-cache'
              }).catch(err => console.warn(`[PWA] Error cacheando ${url}:`, err))
            )
          );

          console.log('[PWA] Pre-caché completado');
        }
      } catch (error) {
        console.error('[PWA] Error en pre-caché:', error);
      }
    };

    // Ejecutar pre-caché después de 2 segundos (para no bloquear la UI inicial)
    const timeoutId = setTimeout(precachePages, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  return null; // Este componente no renderiza nada
}
