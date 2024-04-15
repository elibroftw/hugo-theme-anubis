const CACHE_NAME = 'v1';

self.addEventListener('install', function(event) {
  event.waitUntil(
    fetch('/index.xml')
      .then(function(response) {
        return response.text();
      })
      .then(function(xmlData) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(xmlData, 'application/xml');
        // include home page
        var urls = Array.from(doc.getElementsByTagName('link'))
          .slice(0, 51)
          .map(function(link) {
            return new URL(link.textContent).pathname;
        });

        console.log(urls);

        return caches.open(CACHE_NAME).then(function(cache) {
          return cache.addAll(urls);
        });
      })
  );
});

const CACHE_FIRST_HOSTS = new Set(['latex.codecogs.com'])

async function cacheFirstWithRefresh(request) {
  console.log(request);
  // TODO: https://latex.codecogs.com/ should be cache first
  const fetchResponsePromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  return (await caches.match(request)) || (await fetchResponsePromise);
}

self.addEventListener('fetch', function(event) {
  event.respondWith(cacheFirstWithRefresh(event.request));
});