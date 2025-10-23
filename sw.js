const CACHE_NAME = 'fsu-status-v1';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './app.js',  // <-- This is the important addition
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Serve from cache
        }
        return fetch(event.request); // Not in cache, fetch from network
      }
    )
  );
});