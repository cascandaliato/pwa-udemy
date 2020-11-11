self.addEventListener("install", (event) => {
  // console.log("[Service Worker] Installing Service Worker...", event);

  event.waitUntil(
    caches.open("static").then((cache) => {
      console.log("[Service Worker] Precaching App Shell");
      cache.add("/src/js/app.js");
    })
  );
});

self.addEventListener("activate", (event) => {
  // console.log("[Service Worker] Activating Service Worker...", event);
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // console.log("[Service Worker] Fetching something...", event);
  event.respondWith(fetch(event.request));
});

// self.addEventListener("message", function (e) {});
