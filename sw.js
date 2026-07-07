const CACHE_NAME = 'namaz-times-v42-07-Jul-2026-1437_offsets_redirect';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// 1. Install Event: Saves the core app shell files into phone memory
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching app shell files...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Install Event: Saves the core app shell files into phone memory

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Delete old caches
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache structure...', cache);
            return caches.delete(cache);
          }
        })
      );

      // Take control of all open clients
      await self.clients.claim();

      // Notify all open pages that a new SW is active
      const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true
      });

      clients.forEach(client => {
        client.postMessage({
          type: "SW_UPDATED"
        });
      });

      console.log("Service Worker activated.");
    })()
  );
});
// 3. Fetch Event: Intercepts requests to serve cached files instantly when offline
self.addEventListener('fetch', (event) => {
  // We only want to handle local files (not your live Google Apps Script API calls)
  if (event.request.url.includes('script.google.com')) {
    return; // Let the browser handle live API data requests normally
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return the cached file if found, otherwise download it from the network
      return cachedResponse || fetch(event.request);
    })
  );
});
