var CACHE_NAME = 'quizinato';
var urlsToCache = [
  'index.html',
  'icons/app_title.png',
  'icons/challenge.png',
  'icons/empty.png',
  'icons/icon_192x192.png',
  'icons/icon_512x512.png',
  'icons/learn.png',
  'icons/login.png',
  'icons/logo-small.png',
  'icons/offline.png',
  'icons/sht_chl.png',
  'icons/sht_login.png',
  'icons/sht_signin.png',
  'icons/signin.png',
  'icons/void.png',
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
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
        }
      )
    );
  });