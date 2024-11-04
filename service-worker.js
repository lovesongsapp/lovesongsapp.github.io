const CACHE_NAME = 'my-site-cache-v1.1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/offline.html'
];

// Instalação do service worker e cache dos recursos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cached offline page during install');
      return cache.addAll(urlsToCache);
    }).then(() => self.skipWaiting())
  );
});

// Fetch event para servir recursos do cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        console.log('Serving from cache: ', event.request.url);
        return response;
      }

      console.log('Fetching from network: ', event.request.url);
      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const clonedResponse = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clonedResponse);
        });

        return networkResponse;
      }).catch(() => {
        console.log('Fetch failed; returning offline page instead.');
        return caches.match('/offline.html');
      });
    })
  );
});

// Ativação do service worker e limpeza de caches antigos
self.addEventListener('activate', event => {
  console.log('Activating new service worker...');

  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Sincronização em segundo plano
self.addEventListener('sync', event => {
  if (event.tag === 'sync-user-data') {
    event.waitUntil(syncUserData());
  }
});

function syncUserData() {
  return fetch('/sync-data')
    .then(response => response.json())
    .then(data => {
      console.log('Dados do usuário sincronizados:', data);
    })
    .catch(error => {
      console.error('Erro ao sincronizar os dados do usuário:', error);
    });
}

// Sincronização periódica
self.addEventListener('periodicsync', event => {
  if (event.tag === 'periodic-sync') {
    event.waitUntil(checkForUpdates());
  }
});

function checkForUpdates() {
  return fetch('/check-updates')
    .then(response => response.json())
    .then(data => {
      console.log('Atualizações verificadas:', data);
    })
    .catch(error => {
      console.error('Erro ao verificar atualizações:', error);
    });
}

// Notificações push
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'Você tem uma nova notificação!',
    icon: data.icon || '/bank/logos/icon192.png',
    badge: data.badge || '/bank/logos/icon192.png'
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Nova notificação', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});

// Atualizações do Service Worker
let newWorker;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    }).then(() => {
      self.skipWaiting();
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
//MEDIA SESSION
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(clients.openWindow('/'));
});
//LOGIC FOR BLOCK ADS - REMOVER SE NAO EFICIENTE
self.addEventListener('fetch', event => {
    const url = event.request.url;
    // Verifica URLs de servidores conhecidos de anúncios do YouTube e DoubleClick
    if (
        url.includes('doubleclick.net') || 
        url.includes('ad.doubleclick.net') || 
        url.includes('googlesyndication.com') ||
        url.includes('youtube.com/pagead/') || 
        url.includes('ytimg.com/an_webp')
    ) {
        console.log('Requisição de anúncio bloqueada para:', url);
        
        // Responde com uma resposta em branco, efetivamente bloqueando o anúncio
        event.respondWith(new Response('', { status: 204 }));
    }
});
