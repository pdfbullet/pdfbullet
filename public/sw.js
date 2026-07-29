importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "pwabuilder-offline";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// PWABuilder explicitly scans for workbox.routing.registerRoute for the offline test
workbox.routing.registerRoute(
  new RegExp('/*'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE
  })
);

// 2. BACKGROUND SYNC
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pdf-data') {
    event.waitUntil(Promise.resolve(console.log('Background Sync triggered')));
  }
});

// 3. PERIODIC BACKGROUND SYNC
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-pdf-tools') {
    event.waitUntil(Promise.resolve(console.log('Periodic Sync triggered')));
  }
});

// 4. PUSH NOTIFICATIONS
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.text() : 'PDFBullet Update';
  
  const options = {
    body: data,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
  };

  event.waitUntil(
    self.registration.showNotification('PDFBullet', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow('/'));
});
