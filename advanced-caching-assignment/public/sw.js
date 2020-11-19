var CACHE_STATIC_NAME = "static-v2";
var CACHE_DYNAMIC_NAME = "dynamic-v1";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/src/css/app.css",
  "/src/css/main.css",
  "/src/js/main.js",
  "/src/js/material.min.js",
  "https://fonts.googleapis.com/css?family=Roboto:400,700",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(function (cache) {
      cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(
        keyList.map(function (key) {
          if (key !== CACHE_STATIC_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// cache with network fallback
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) {
        return response;
      } else {
        return fetch(event.request)
          .then(function (res) {
            return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
              cache.put(event.request.url, res.clone()); // optional
              return res;
            });
          })
          .catch(function (err) {});
      }
    })
  );
});

// network only
// self.addEventListener("fetch", (event) =>
//   event.respondWith(fetch(event.request))
// );

// cache only
// self.addEventListener("fetch", function (event) {
//   event.respondWith(caches.match(event.request));
// });

// network with cache fallback
// self.addEventListener("fetch", function (event) {
//   event.respondWith(
//     fetch(event.request)
//       .then((res) =>
//         // optional
//         caches
//           .open(CACHE_DYNAMIC_NAME)
//           .then((cache) => cache.put(event.request.url, res.clone()))
//       )
//       .catch(() => caches.match(event.request))
//   );
// });

// cache then network
// self.addEventListener("fetch", function (event) {
//   event.respondWith(
//     caches.match(event.request).then(function (response) {
//       if (response) {
//         fetch(event.request).then((res) => cache.put(event.request.url, res));
//       }
//       return response;
//     })
//   );
// });

// mixed
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) {
        return response;
      } else {
        return fetch(event.request)
          .then(function (res) {
            return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
              cache.put(event.request.url, res.clone()); // optional
              return res;
            });
          })
          .catch(function (err) {});
      }
    })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.url.indexOf("https://httpbin.org/ip") > -1) {
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
        return fetch(event.request).then(function (res) {
          cache.put(event.request.url, res.clone());
          return res;
        });
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        } else if (STATIC_ASSETS.includes(event.request.url)) {
          event.respondWith(caches.match(event.request));
        } else {
          return fetch(event.request)
            .then(function (res) {
              return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
                cache.put(event.request.url, res.clone()); // optional
                return res;
              });
            })
            .catch(function (err) {});
        }
      })
    );
  }
});
