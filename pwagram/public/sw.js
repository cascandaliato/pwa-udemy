self.addEventListener("install", (event) => {
  // console.log("[Service Worker] Installing Service Worker...", event);

  event.waitUntil(
    caches.open("static").then((cache) => {
      console.log("[Service Worker] Precaching App Shell");
      // cache.add("/");
      // cache.add("/index.html");
      // cache.add("/src/js/app.js");
      cache.addAll([
        "/",
        "/index.html",
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
  // console.log("[Service Worker] Activating Service Worker...", event);
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // console.log("[Service Worker] Fetching something...", event);
  event.respondWith(
    caches.match(event.request).then((response) => {
      // null if cache miss
      if (response) {
        return response;
      } else {
        return fetch(event.request);
      }
    })
    // fetch(event.request)
  );
});

// self.addEventListener("message", function (e) {});
