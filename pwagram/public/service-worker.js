importScripts("workbox-sw.prod.v2.1.3.js");
importScripts("/src/js/idb.js");
importScripts("/src/js/utility.js");

const workboxSW = new self.WorkboxSW();

workboxSW.router.registerRoute(
  /.*(?:googleapis|gstatic)\.com.*$/,
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "google-fonts",
    cachExpiration: { maxEntries: 3, maxAgeSeconds: 60 * 60 * 24 * 30 },
  })
);

workboxSW.router.registerRoute(
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
  workboxSW.strategies.staleWhileRevalidate({ cacheName: "material-css" })
);

workboxSW.router.registerRoute(
  /.*(?:firebasestorage\.googleapis)\.com.*$/,
  workboxSW.strategies.staleWhileRevalidate({ cacheName: "post-images" })
);

workboxSW.router.registerRoute(
  "https://pwa-udemy-9d70f.firebaseio.com/posts.json",
  function (args) {
    return fetch(args.event.request).then((res) => {
      const clonedRes = res.clone();
      clearAllData("posts")
        .then(() => clonedRes.json())
        .then((data) => {
          Object.keys(data).forEach((k) =>
            writeData("posts", data[k]).then(() => {})
          );
        });
      return res;
    });
  }
);

workboxSW.router.registerRoute(
  (routeData) =>
    routeData.event.request.headers.get("accept").includes("text/html"),
  function (args) {
    return caches.match(args.event.request).then((response) => {
      if (response) {
        return response;
      } else {
        return fetch(args.event.request)
          .then((res) => {
            return caches.open("dynamic").then((cache) => {
              cache.put(args.event.request.url, res.clone());
              return res;
            });
          })
          .catch(() => caches.match("/offline.html"));
      }
    });
  }
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
    "revision": "f06b6ad2808c86144f9838fd19753a96"
  },
  {
    "url": "service-worker.js",
    "revision": "00a541aef911b01e1ccc000275c0cf68"
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

self.addEventListener("sync", (event) => {
  console.log("[Service Worker] Background syncing", event);
  if (event.tag === "sync-new-post") {
    console.log("[Service Worker] Syncing new post");
    event.waitUntil(
      readAllData("sync-posts").then((data) => {
        for (const dt of data) {
          const postData = new FormData();
          postData.append("id", dt.id);
          postData.append("title", dt.title);
          postData.append("location", dt.location);
          postData.append("rawLocationLat", dt.rawLocation.lat);
          postData.append("rawLocationLng", dt.rawLocation.lng);
          postData.append("file", dt.picture, dt.id + ".png");

          fetch(url, {
            method: "POST",
            body: postData,
            // headers: {
            //   "Content-Type": "application/json",
            //   Accept: "application/json",
            // },
            // body: JSON.stringify({
            //   id: dt.id,
            //   title: dt.title,
            //   location: dt.location,
            //   image:
            //     "https://firebasestorage.googleapis.com/v0/b/pwa-udemy-9d70f.appspot.com/o/sf-boat.jpg?alt=media&token=bdc56969-742d-4ec6-a9cb-5aecd188f4ff",
            // }),
          })
            .then((res) => {
              console.log("Send data", res);
              if (res.ok) {
                deleteItemFromData("sync-posts", dt.id);
              }
            })
            .catch(console.error);
        }
      })
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  const action = event.action;

  console.log(notification);

  if (action === "confirm") {
    console.log("Confirm was chosen");
    notification.close();
  } else {
    console.log(action);
    event.waitUntil(
      clients.matchAll().then((clis) => {
        const client = clis.find((c) => c.visibility === "visible");
        if (client !== undefined) {
          // client.navigate("https://localhost:8080");
          client.navigate(notification.data.url);
          client.focus();
        } else {
          // clients.openWindow("http://localhost:8080");
          clients.openWindow(notification.data.url);
        }
        notification.close();
      })
    );
  }
});

self.addEventListener("notificationclose", (event) => {
  console.log("Notification was closed", event);
});

self.addEventListener("push", (event) => {
  console.log("Push notification received", event);

  let data = { title: "New!", content: "Something new happened", openUrl: "/" };
  if (event.data) {
    data = JSON.parse(event.data.text());
  }

  const options = {
    body: data.content,
    icon: "/src/images/icons/app-icon-96x96.png",
    badge: "/src/images/icons/app-icon-96x96.png",
    data: { url: data.openUrl },
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});
