// filepath: g:\www\love\sw.js

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('video-player-cache').then(function(cache) {
            return cache.addAll([
                '/',
                '/index.html',
                '/css/index.css',
                '/js/app.js',
                '/fonts/Roboto-Regular.ttf',
                // Adicione os ícones do player aqui
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});