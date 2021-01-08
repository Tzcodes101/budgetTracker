const CACHE_NAME = "my-site-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

const FILES_TO_CACHE = [
  //add files to cache
  "/",
  "./indexedDB.js",
  "./index.html",
  "./styles.css",
  "./index.js",
  "./icons/icon-192x192.png",
  "./icons/icon-512x512.png",
  "./manifest.json"
]

//service worker code
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(self.skipWaiting())
  );
});

//clean up old caches
self.addEventListener(`activate`, event => {
  const currentCaches = [CACHE_NAME, DATA_CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames =>
        // return array of cache names that are old to delete
        cacheNames.filter(cacheName => !currentCaches.includes(cacheName))
      )
      .then(cachesToDelete =>
        Promise.all(
          cachesToDelete.map(cacheToDelete => caches.delete(cacheToDelete))
        )
      )
      .then(() => self.clients.claim())
  );
});


//fetch from caches
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    console.log('[Service Worker] Fetch(data)', event.request.url)
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then(response => {
            if (response.status === 200) {
              cache.put(event.request.url, response.clone())
            }
            return response;
          }).catch(err => {
            return cache.match(event.request);
          });
      })
    );
    return;
  }
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        return response || fetch(event.request);
      });
    })
  );
});

