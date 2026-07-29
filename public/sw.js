const CACHE_NAME = 'pdfbullet-offline-v2';

const OFFLINE_URLS = [
  '/',
  '/?source=pwa',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// 1. OFFLINE SUPPORT (Caching)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Stale-while-revalidate for GET requests
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        }).catch(() => {
          // Fallback if network fails and not in cache
          return cachedResponse || new Response('Offline - Connect to internet to use this tool.', {
            headers: { 'Content-Type': 'text/plain' }
          });
        });
        return cachedResponse || fetchPromise;
      })
    );
  }
});

// 2. BACKGROUND SYNC
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pdf-data') {
    event.waitUntil(
      // Placeholder for actual sync logic
      Promise.resolve(console.log('Background Sync triggered: sync-pdf-data'))
    );
  }
});

// 3. PERIODIC BACKGROUND SYNC
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-pdf-tools') {
    event.waitUntil(
      // Placeholder for periodic sync logic
      Promise.resolve(console.log('Periodic Sync triggered: update-pdf-tools'))
    );
  }
});

// 4. PUSH NOTIFICATIONS
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.text() : 'PDFBullet Update';
  
  const options = {
    body: data,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    }
  };

  event.waitUntil(
    self.registration.showNotification('PDFBullet', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow('/')
  );
});
