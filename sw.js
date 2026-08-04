const CACHE_NAME = 'toolbox-v2.0';
const urlsToCache = [
    './',
    './index.html',
    './css/common.css',
    './js/core/app.js',
    './js/core/storage.js',
    './js/core/sync.js',
    './js/modules/pet-ring.js',
    './js/modules/tree-plant.js',
    './js/modules/pet-hunt.js',
    './js/modules/shop-helper.js',
    './js/modules/equipment-query.js',
    './js/modules/total-stats.js',
    './manifest.json'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('缓存已打开');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
