let deferredPrompt;

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
