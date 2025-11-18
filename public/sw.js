// Service Worker for ACT Reportes
// This file will be processed by workbox-webpack-plugin

const CACHE_NAME = 'act-reportes-v3';

// Workbox will inject the manifest here
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
  // Workbox manifest will be injected
  ...self.__WB_MANIFEST.map(entry => typeof entry === 'string' ? entry : entry.url)
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing v3...');
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching essential pages...');
      return cache.addAll(urlsToCache);
    })
    .then(() => {
      console.log('[SW] ✅ Install complete');
    })
    .catch((error) => {
      console.error('[SW] ❌ Install failed:', error);
    })
  );
});

// Activate event
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
    })
    .then(() => {
      console.log('[SW] ✅ Activated, claiming clients...');
      return self.clients.claim();
    })
  );
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome extensions and non-http requests
  if (!request.url.startsWith('http')) return;

  // Skip Supabase API calls
  if (request.url.includes('supabase.co')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone();

        // Cache successful responses
        if (response && response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }

        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request).then((response) => {
          if (response) {
            console.log('[SW] ✅ Cache HIT:', request.url);
            return response;
          }

          // If navigate mode, show offline page
          if (request.mode === 'navigate') {
            return caches.match('/offline');
          }

          // Return generic offline response
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Message event for skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] ✅ Service Worker v3 loaded');
