const CACHE_STATIC_NAME = "static-v12";
const CACHE_DYNAMIC_NAME = "dynamic-v12";

self.addEventListener("install", (event) => {
  // console.log("[Service Worker] Installing Service Worker...", event);

  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then((cache) => {
      console.log("[Service Worker] Precaching App Shell");
      // cache.add("/");
      // cache.add("/index.html");
      // cache.add("/src/js/app.js");
      cache.addAll([
        "/",
        "/index.html",
        "/offline.html",
        "/src/js/app.js",
        "/src/js/feed.js",
        // "/src/js/promise.js", // no point in storing these, older browsers won't have support for cache and service worker anyway; except in this case they are always loaded so caching them will speed things up
        // "/src/js/fetch.js",
        "/src/js/material.min.js",
        "/src/css/app.css",
        "/src/css/feed.css",
        "/src/images/main-image.jpg",
        "https://fonts.googleapis.com/css?family=Roboto:400,700",
        "https://fonts.googleapis.com/icon?family=Material+Icons",
        "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
      ]);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating Service Worker...", event);
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log("[Service Worker] Removing old cache ", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  return self.clients.claim();
});

// cache with network fallback
self.addEventListener("fetch", (event) => {
  console.log("[Service Worker] Fetching something...", event);
  event.respondWith(
    caches.match(event.request).then((response) => {
      // null if cache miss
      if (response) {
        return response;
      } else {
        return fetch(event.request)
          .then((res) => {
            return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
              cache.put(event.request.url, res.clone());
              return res;
            });
          })
          .catch(() =>
            caches
              .open(CACHE_STATIC_NAME)
              .then((cache) => cache.match("/offline.html"))
          );
      }
    })
    // fetch(event.request)
  );
});

// cache-only
// self.addEventListener("fetch", (event) => {
//   console.log("[Service Worker] Fetching something...", event);
//   event.respondWith(caches.match(event.request));
// });

// network-only
// self.addEventListener("fetch", (event) => {
//   event.respondWith(fetch(event.request));
// });

// network with cache fallback
// self.addEventListener("fetch", (event) => {
//   console.log("[Service Worker] Fetching something...", event);
//   event.respondWith(
//     fetch(event.request).then(/* optionally cache */).catch((_) => caches.match(event.request))
//   );
// });

// self.addEventListener("message", function (e) {});
