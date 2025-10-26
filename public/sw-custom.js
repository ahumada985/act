// Service Worker personalizado para ACT Reportes
// Versión 2.4.0 - Fix offline con cierre forzado

// Workbox manifest injection point
const WB_MANIFEST = self.__WB_MANIFEST || [];

const CACHE_NAME = 'act-reportes-v2.4.0';
const PRECACHE_URLS = [
  '/',
  '/offline',
  '/dashboard',
  '/reportes',
  '/proyectos',
  '/mapa',
  '/galeria',
  '/logo.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.json',
  ...WB_MANIFEST.map(entry => entry.url),
];

// Instalación: Cachear recursos críticos inmediatamente
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v2.4.0');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching critical resources');
      return cache.addAll(PRECACHE_URLS);
    }).then(() => {
      console.log('[SW] Precache complete');
      return self.skipWaiting(); // Activar inmediatamente
    })
  );
});

// Activación: Limpiar cachés viejos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v2.4.0');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim(); // Tomar control inmediatamente
    })
  );
});

// Fetch: Estrategia Cache First para páginas, Network First para API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests que no sean HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Ignorar requests a Supabase (siempre necesitan red)
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  // ESTRATEGIA CACHE FIRST para navegación y assets estáticos
  // Esto asegura que funcione offline incluso sin red
  if (request.mode === 'navigate' || request.destination === 'document' ||
      request.destination === 'script' || request.destination === 'style' ||
      request.destination === 'image') {

    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[SW] ✅ Cache HIT:', request.url);

          // Actualizar en background si hay red
          fetch(request).then((response) => {
            if (response && response.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, response);
              });
            }
          }).catch(() => {
            // Sin red, pero ya servimos desde cache
          });

          return cachedResponse;
        }

        // No está en caché, intentar red
        console.log('[SW] ⚠️ Cache MISS, trying network:', request.url);
        return fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          })
          .catch(() => {
            // Sin caché y sin red
            if (request.mode === 'navigate') {
              console.log('[SW] ❌ No cache, no network, showing /offline');
              return caches.match('/offline');
            }
            return new Response('Network error', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' },
            });
          });
      })
    );
  } else {
    // Para otros requests (API, etc), Network First
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
  }
});

// Mensaje: Permitir comunicación con la página
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(urls);
      })
    );
  }
});

console.log('[SW] Service Worker v2.4.0 loaded - Cache First Strategy');
