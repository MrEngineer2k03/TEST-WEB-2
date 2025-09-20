const CACHE_NAME = 'smartbins-v2';
const STATIC_CACHE = 'smartbins-static-v2';
const DYNAMIC_CACHE = 'smartbins-dynamic-v2';

const ASSETS = [
  './',
  './index.html',
  './web.css',
  './web.js',
  './manifest.json',
  './offline.html',
  './campusmap.png'
];

self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('Service Worker: Install failed', err))
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key =>
          key !== STATIC_CACHE &&
          key !== DYNAMIC_CACHE
        ).map(key => {
          console.log('Service Worker: Removing old cache', key);
          return caches.delete(key);
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone and cache the response
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Try cache first, then offline page
          return caches.match(event.request)
            .then(response => response || caches.match('./offline.html'));
        })
    );
    return;
  }

  // For static assets, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        // Not in cache, fetch from network
        return fetch(event.request).then(fetchResponse => {
          // Don't cache if not a success response
          if (!fetchResponse || fetchResponse.status !== 200) {
            return fetchResponse;
          }

          // Clone the response
          const responseClone = fetchResponse.clone();

          // Cache the fetched response
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, responseClone);
          });

          return fetchResponse;
        });
      })
      .catch(() => {
        // If both cache and network fail, show offline page
        if (event.request.destination === 'document') {
          return caches.match('./offline.html');
        }
      })
  );
});

// Handle messages from the client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    console.log('Service Worker: Syncing data...');
  }
});
