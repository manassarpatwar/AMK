let cache= null;
let dataCacheName = 'chatData-v1';
let cacheName = 'chat';

let filesToCache = [
    '/',
    '/stylesheets/chat.css',
    '/stylesheets/index.css',
    '/stylesheets/WebRTC.css',
    '/stylesheets/bootstrap.min.css',
    '/scripts/bootstrap.min.js',
    '/scripts/canvas.min.js',
    '/scripts/jquery-3.6.0.min.js',
    '/scripts/database.js',
    '/scripts/swapImages.js',
    '/scripts/WebRTC.js',
    '/scripts/index.js',
    '/scripts/idb/index.js',
    '/scripts/idb/wrap-idb-value.js',
    '/fonts/glyphicons-halflings-regular.woff',
    '/fonts/glyphicons-halflings-regular.ttf'
];

/**
 * installation event: it adds all the files to be cached
 */
self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function (cacheX) {
            console.log('[ServiceWorker] Caching app shell');
            cache= cacheX;
            return cache.addAll(filesToCache)
                .catch(err => console.log(err));
        })
    );
});

/**
 * activation of service worker: it removes all cashed files if necessary
 */
self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== cacheName && key !== dataCacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    //Fixes a corner case in which the app wasn't returning the latest data.
    return self.clients.claim();
});

/**
 * this is called every time a file is fetched. This is a middleware, i.e. this method is
 * called every time a page is fetched by the browser
 * implementing "Cache, falling back to the network"
 */
self.addEventListener('fetch', (event) => {
    event.respondWith(async function() {
        const response = await caches.match(event.request);
        return response || fetch(event.request);
    }());
});