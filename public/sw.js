const CACHE_NAME = 'pdfbullet-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // A basic fetch handler to satisfy PWA requirements
  // We can expand this later for offline support if needed
  event.respondWith(fetch(event.request).catch(() => {
    return new Response('Offline content goes here');
  }));
});
