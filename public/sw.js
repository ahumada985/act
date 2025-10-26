// Service Worker SIMPLE para ACT Reportes v3.0.0

// Workbox manifest injection point (requerido por next-pwa)
const WB_MANIFEST = self.__WB_MANIFEST || [];

const CACHE_NAME = 'act-reportes-v3';
const urlsToCache = [
  '/',
  '/offline',
  '/dashboard',
  '/reportes',
  '/proyectos',
  '/mapa',
  '/galeria',
  '/manifest.json',
  '/logo.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  ...WB_MANIFEST.map(entry => entry.url || entry),
];

// Install - Cachear inmediatamente
self.addEventListener('install', (event) => {
  console.log('[SW] Installing v3...');

  // SKIP WAITING inmediatamente
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching pages...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] ✅ Install complete');
      })
      .catch((err) => {
        console.error('[SW] ❌ Install failed:', err);
      })
  );
});

// Activate - Tomar control inmediatamente
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating v3...');

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
      console.log('[SW] ✅ Activated, claiming clients...');
      return self.clients.claim();
    })
  );
});

// Fetch - Cache First
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignorar requests no-http
  if (!request.url.startsWith('http')) {
    return;
  }

  // Ignorar Supabase
  if (request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          console.log('[SW] ✅ Cache HIT:', request.url);
          return response;
        }

        console.log('[SW] ⚠️ Cache MISS, fetching:', request.url);
        return fetch(request)
          .then((response) => {
            // Solo cachear responses válidas
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });

            return response;
          })
          .catch(() => {
            // Si es navegación y no hay cache, mostrar offline
            if (request.mode === 'navigate') {
              return caches.match('/offline');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Message handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] ✅ Service Worker v3 loaded');
