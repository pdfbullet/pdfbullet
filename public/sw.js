// This is the "Offline copy of pages" service worker
const CACHE = "pwabuilder-offline";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.add(new Request('/', { cache: 'reload' })))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;
        if (preloadResp) {
          return preloadResp;
        }
        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {
        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match('/');
        return cachedResp;
      }
    })());
  }
});

// BACKGROUND SYNC
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pdf-data') {
    event.waitUntil(Promise.resolve());
  }
});

// PERIODIC BACKGROUND SYNC
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-pdf-tools') {
    event.waitUntil(Promise.resolve());
  }
});

// PUSH NOTIFICATIONS
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.text() : 'PDFBullet Update';
  event.waitUntil(
    self.registration.showNotification('PDFBullet', { body: data })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow('/'));
});
