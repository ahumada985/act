// Service Worker personalizado para ACT Reportes
// Versión 2.1.0

const CACHE_NAME = 'act-reportes-v2.1.0';
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
];

// Instalación: Cachear recursos críticos inmediatamente
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v2.1.0');

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
  console.log('[SW] Activating service worker v2.1.0');

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

// Fetch: Estrategia Network First con fallback a cache
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

  event.respondWith(
    // Intentar red primero
    fetch(request, { timeout: 5000 })
      .then((response) => {
        // Si la respuesta es válida, guardarla en caché
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar caché
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Serving from cache:', request.url);
            return cachedResponse;
          }

          // Si no hay en caché y es una navegación, mostrar página offline
          if (request.mode === 'navigate') {
            return caches.match('/offline');
          }

          // Para otros recursos, retornar error
          return new Response('Network error', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
      })
  );
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

console.log('[SW] Service Worker v2.1.0 loaded');
