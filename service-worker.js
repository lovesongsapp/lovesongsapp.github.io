const CACHE_NAME = 'lovesongsapp-cache-v2.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/offline.html'
];

// Instalação do service worker e cache dos recursos iniciais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cached offline page during install');
      return cache.addAll(urlsToCache);
    }).then(() => self.skipWaiting())
  );
});

// Fetch event: Onde corrigimos o erro do "Estilingue" (Aw Snap!)
self.addEventListener('fetch', event => {
  // Só processamos requisições GET
  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  // --- CORREÇÃO CRÍTICA PARA VÍDEOS DO YOUTUBE ---
  // Se a requisição for para o YouTube ou servidores de vídeo do Google,
  // nós saímos do Service Worker e deixamos a rede cuidar disso.
  // Isso evita o estouro de memória aos 3:04 de vídeo.
  if (url.includes('youtube.com') || url.includes('googlevideo.com') || url.includes('ytimg.com')) {
    return; 
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }

      return fetch(event.request).then(networkResponse => {
        // Não cacheamos respostas que não sejam sucesso padrão (status 200)
        // Isso protege contra erros de Range Requests (comum em mídias)
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const clonedResponse = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clonedResponse);
        });

        return networkResponse;
      }).catch(() => {
        // Se falhar a rede e for uma navegação de página, mostra o offline.html
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', event => {
  console.log('Activating new service worker...');
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
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

// Notificação de clique
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});

// Recebe mensagem para skipWaiting
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

