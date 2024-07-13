const CACHE_NAME = 'LoveSongs-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html'
];

self.addEventListener("install", (event) => {
  console.log("Install Event processing");

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      try {
        await cache.addAll(urlsToCache);
        console.log("Cached offline page during install");
      } catch (error) {
        console.error("Cache addAll error during installation:", error);
      }
    })()
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(event.request);

        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, response.clone());

        console.log("Adding page to offline cache: " + response.url);

        return response;
      } catch (error) {
        console.error("Network request failed. Serving content from cache:", error);
        return fromCache(event.request);
      }
    })()
  );
});

if ('serviceWorker' in navigator && 'SyncManager' in window) {
  navigator.serviceWorker.ready.then(async (registration) => {
    try {
      await registration.sync.register('database-sync');
      await registration.periodicSync.register('fetch-new-content', {
        minInterval: 24 * 60 * 60 * 1000,
      });
    } catch (error) {
      console.error("Sync or Periodic Sync registration failed:", error);
    }
  });
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'database-sync') {
    event.waitUntil(
      pushLocalDataToDatabase && pushLocalDataToDatabase()
    );
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'fetch-new-content') {
    event.waitUntil(
      fetchNewContent && fetchNewContent()
    );
  }
});

self.addEventListener('push', (event) => {
  event.waitUntil(
    self.registration.showNotification('Notification Title', {
      body: 'Notification Body Text',
      icon: 'custom-notification-icon.png',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const fullPath = self.location.origin + event.notification.data.path;
  clients.openWindow(fullPath);
});

function fromCache(request) {
  return caches.open(CACHE_NAME).then((cache) => {
    return cache.match(request).then((matching) => {
      if (!matching || matching.status === 404) {
        if (request.destination !== "document" || request.mode !== "navigate") {
          return caches.match('/offline.html');
        }
        return caches.match('/offline.html');
      }
      return matching;
    });
  });
}
