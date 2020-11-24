importScripts("/src/js/idb.js");
importScripts("/src/js/utility.js");

const VER = 39;

const CACHE_STATIC_NAME = `static-v${VER}`;
const CACHE_DYNAMIC_NAME = `dynamic-v${VER}`;

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/src/js/app.js",
  "/src/js/feed.js",
  "/src/js/idb.js",
  "/src/js/material.min.js",
  "/src/css/app.css",
  "/src/css/feed.css",
  "/src/images/main-image.jpg",
  "https://fonts.googleapis.com/css?family=Roboto:400,700",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
];

function trimCache(cacheName, maxItems) {
  caches.open(cacheName).then((cache) =>
    cache.keys().then((keys) => {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(() => trimCache(cacheName, maxItems));
      }
    })
  );
}

function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) {
    // request targets domain where we serve the page from (i.e. NOT a CDN)
    console.log("matched ", string);
    cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
  } else {
    cachePath = string; // store the full request (for CDNs)
  }
  return array.indexOf(cachePath) > -1;
}

self.addEventListener("install", (event) => {
  // console.log("[Service Worker] Installing Service Worker...", event);

  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then((cache) => {
      console.log("[Service Worker] Precaching App Shell");
      // cache.add("/");
      // cache.add("/index.html");
      // cache.add("/src/js/app.js");
      // cache.addAll([
      //   "/",
      //   "/index.html",
      //   "/offline.html",
      //   "/src/js/app.js",
      //   "/src/js/feed.js",
      //   // "/src/js/promise.js", // no point in storing these, older browsers won't have support for cache and service worker anyway; except in this case they are always loaded so caching them will speed things up
      //   // "/src/js/fetch.js",
      //   "/src/js/material.min.js",
      //   "/src/css/app.css",
      //   "/src/css/feed.css",
      //   "/src/images/main-image.jpg",
      //   "https://fonts.googleapis.com/css?family=Roboto:400,700",
      //   "https://fonts.googleapis.com/icon?family=Material+Icons",
      //   "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
      // ]);
      cache.addAll(STATIC_ASSETS);
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

// cache then network + cache with network fallback (route-based)
self.addEventListener("fetch", (event) => {
  console.log("[Service Worker] Fetching something...", event);

  const url = "https://pwa-udemy-9d70f.firebaseio.com/posts.json";

  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      // caches.open(CACHE_DYNAMIC_NAME).then((cache) =>
      //   fetch(event.request).then((res) => {
      //     // trimCache(CACHE_DYNAMIC_NAME, 3);
      //     cache.put(event.request, res.clone());
      //     return res;
      //   })
      // )
      fetch(event.request).then((res) => {
        const clonedRes = res.clone();
        clearAllData("posts")
          .then(() => clonedRes.json())
          .then((data) => {
            Object.keys(data).forEach((k) =>
              writeData("posts", data[k]).then(() => {
                // deleteItemFromData("posts", k)
              })
            );
          });
        return res;
      })
    );
  } else if (
    // new RegExp("\\b" + STATIC_ASSETS.join("\\b|\\b") + "\\b").test(
    //   event.request.url
    isInArray(event.request.url, STATIC_ASSETS)
  ) {
    // cache-only strategy for static assets
    event.respondWith(caches.match(event.request));
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // null if cache miss
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then((res) => {
              return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
                // trimCache(CACHE_DYNAMIC_NAME, 3);
                cache.put(event.request.url, res.clone());
                return res;
              });
            })
            .catch(() =>
              caches.open(CACHE_STATIC_NAME).then((cache) => {
                // if (event.request.url.indexOf("/help") > -1) {
                if (event.request.headers.get("accept").includes("text/html")) {
                  return cache.match("/offline.html");
                }
              })
            );
        }
      })
    );
  }
});

// cache with network fallback
// self.addEventListener("fetch", (event) => {
//   console.log("[Service Worker] Fetching something...", event);
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       // null if cache miss
//       if (response) {
//         return response;
//       } else {
//         return fetch(event.request)
//           .then((res) => {
//             return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
//               cache.put(event.request.url, res.clone());
//               return res;
//             });
//           })
//           .catch(() =>
//             caches
//               .open(CACHE_STATIC_NAME)
//               .then((cache) => cache.match("/offline.html"))
//           );
//       }
//     })
//     // fetch(event.request)
//   );
// });

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
