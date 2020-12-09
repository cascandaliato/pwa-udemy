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

workboxSW.precache([]);

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
