importScripts("workbox-sw.prod.v2.1.3.js");

const workboxSW = new self.WorkboxSW();

workboxSW.router.registerRoute(
  /.*(?:googleapis|gstatic)\.com.*$/,
  workboxSW.strategies.staleWhileRevalidate({ cacheName: "google-fonts" })
);

workboxSW.router.registerRoute(
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
  workboxSW.strategies.staleWhileRevalidate({ cacheName: "material-css" })
);

workboxSW.router.registerRoute(
  /.*(?:firebasestorage\.googleapis)\.com.*$/,
  workboxSW.strategies.staleWhileRevalidate({ cacheName: "post-images" })
);

workboxSW.precache([
  {
    "url": "404.html",
    "revision": "0a27a4163254fc8fce870c8cc3a3f94f"
  },
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "b0887b583d094ad99be826a5b0b84e4c"
  },
  {
    "url": "manifest.json",
    "revision": "d1dcad41509e8ea855b76b71093579d6"
  },
  {
    "url": "offline.html",
    "revision": "7000ff32d02067aa6caf1a8633a02176"
  },
  {
    "url": "service-worker-base.js",
    "revision": "44538159507bfbb62f5e6a24087a0dad"
  },
  {
    "url": "service-worker.js",
    "revision": "77a3cf24d0d0a532ae2262e7e87c50b6"
  },
  {
    "url": "src/css/app.css",
    "revision": "59d917c544c1928dd9a9e1099b0abd71"
  },
  {
    "url": "src/css/feed.css",
    "revision": "fbcd7e5a20989892c0366f07bdac377f"
  },
  {
    "url": "src/css/help.css",
    "revision": "1c6d81b27c9d423bece9869b07a7bd73"
  },
  {
    "url": "src/js/app.js",
    "revision": "7e7048e41a480b4055b4c289abcd185c"
  },
  {
    "url": "src/js/feed.js",
    "revision": "9132675757ac4c38271b656174bb27a0"
  },
  {
    "url": "src/js/idb.js",
    "revision": "4a06b71fe5468dcecebcc36ee1c150b1"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "85a1529f541a1dab12612f60f5f537fa"
  },
  {
    "url": "src/js/utility.js",
    "revision": "9e077f40d42d90f0376504b14ee6fd06"
  },
  {
    "url": "sw.js",
    "revision": "49afa940bbb3c3902f361fbe364c6034"
  },
  {
    "url": "workbox-sw.prod.v2.1.3.js",
    "revision": "a9890beda9e5f17e4c68f42324217941"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "31b19bffae4ea13ca0f2178ddb639403"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "c6bb733c2f39c60e3c139f814d2d14bb"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "5c66d091b0dc200e8e89e56c589821fb"
  },
  {
    "url": "src/images/sf-boat.jpg",
    "revision": "0f282d64b0fb306daf12050e812d6a19"
  }
]);
