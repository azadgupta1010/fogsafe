self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('safe-raahi-cache').then(cache => {
      return cache.addAll([
        './',
        './login.html',
        './style.css',
        './manifest.json',
        './icons/icon-192.png',
        './icons/icon-512.png'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
