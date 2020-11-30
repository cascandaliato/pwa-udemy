let deferredPrompt;
const enableNotificationsButtons = document.querySelectorAll(
  ".enable-notifications"
);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js", { scope: "/" }).then(function () {
    console.log("Service worker registered!");
  });
}

window.addEventListener("beforeinstallprompt", (e) => {
  console.log("beforeinstallprompt fired");

  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  return false;

  // Update UI notify the user they can install the PWA
  // showInstallPromotion();
});

// const promise = new Promise((resolve, reject) => {
//   setTimeout(() => {
//     reject({ code: 500, message: "An error occurred!" });
//   }, 3000);
// });

// const xhr = new XMLHttpRequest();
// xhr.open("GET", "https://httpbin.org/ip");
// xhr.responseType = "json";
// xhr.onload = () => {
//   console.log(xhr.response);
// };
// xhr.onerror = () => console.log("Error");
// xhr.send();

// fetch("https://httpbin.org/ip")
//   .then((response) => response.json())
//   .then(console.log)
//   .catch(console.error);

// fetch("https://httpbin.org/post", {
//   method: "POST",
//   header: { "Content-Type": "application/json", Accept: "application/json" },
//   mode: "cors",
//   // mode: "no-cors",
//   body: JSON.stringify({ message: "Does this work?" }),
// })
//   .then((response) => response.json())
//   .then(console.log)
//   .catch(console.error);

// navigator.serviceWorker.controller.postMessage(`foobar`);

function displayConfirmNotification() {
  if ("serviceWorker" in navigator) {
    const options = {
      body: "You successfully subscribed to our Notification service!",
      icon: "/src/images/icons/app-icon-96x96.png",
      image: "/src/images/sf-boat.jpg",
      dir: "ltr",
      lang: "en-US", // BCP 47
      vibrate: [100, 50, 200], // vibration, pause, vibration, ...
      badge: "/src/images/icons/app-icon-96x96.png",
      tag: "confirm-notification", // like an id, to replace an existing notification
      renotify: true, // re-vibrate on same tag
      actions: [
        {
          action: "confirm",
          title: "Okay",
          icon: "/src/images/icons/app-icon-96x96.png",
        },
        {
          action: "cancel",
          title: "Cancel",
          icon: "/src/images/icons/app-icon-96x96.png",
        },
      ],
    };
    navigator.serviceWorker.ready.then(function (swreg) {
      swreg.showNotification(
        "Successfully subscribed (from Service Worker)!",
        options
      );
    });
  }

  // const options = {
  //   body: "You successfully subscribed to our Notification service!",
  // };
  // new Notification("Successfully subscribed!", options);
}

function configurePushSub() {
  if (!("serviceWorker" in navigator)) return;

  let reg;
  navigator.serviceWorker.ready
    .then((swreg) => {
      reg = swreg;
      return swreg.pushManager.getSubscription();
    })
    .then((sub) => {
      if (sub === null) {
        const vapidPublicKey =
          "BPGomLXMPc8ZnoyTP5tmcM8_rMobhDtn98wPRyvlMfxEOhsSJMkwRYZkzno0pcH47APNCqaG9z5Fyz8euWCT4Ww";
        const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey,
        });
      }
    })
    .then((newSub) => {
      console.log(newSub);
      return fetch(
        "https://pwa-udemy-9d70f.firebaseio.com/subscriptions.json",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(newSub),
        }
      );
    })
    .then((res) => {
      if (res.ok) {
        displayConfirmNotification();
      }
    })
    .catch(console.error);
}

function askForNotificationPermission() {
  Notification.requestPermission((result) => {
    console.log("User Choice", result);
    if (result !== "granted") {
      console.log("No notification permission granted!");
    } else {
      // hide button
      configurePushSub();
      // displayConfirmNotification();
    }
  });
}

if ("Notification" in window && "serviceWorker" in navigator) {
  for (let i = 0; i < enableNotificationsButtons.length; i++) {
    enableNotificationsButtons[i].style.display = "inline-block";
    enableNotificationsButtons[i].addEventListener(
      "click",
      askForNotificationPermission
    );
  }
}
