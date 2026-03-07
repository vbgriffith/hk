// PixelDream Service Worker
// Caches all app assets for fully offline use after first load

const CACHE_NAME = 'pixeldream-v1';

// App shell assets to cache
const ASSETS = [
  './',
  './index.html',
];

// Install event — cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching app shell');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// Fetch event — serve from cache if available, else network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Let transformers.js model requests go through to network
  // They self-cache in IndexedDB via the library
  if (
    url.hostname.includes('huggingface.co') ||
    url.hostname.includes('cdn.jsdelivr.net')
  ) {
    // Cache-first for CDN/model assets
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const response = await fetch(event.request);
          if (response.ok && event.request.method === 'GET') {
            cache.put(event.request, response.clone());
          }
          return response;
        } catch {
          return new Response('Offline - resource not cached', { status: 503 });
        }
      })
    );
    return;
  }

  // For everything else — cache-first strategy
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && event.request.method === 'GET') {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
          });
        }
        return response;
      });
    })
  );
});
