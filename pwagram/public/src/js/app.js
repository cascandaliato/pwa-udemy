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

// navigator.serviceWorker.controller.postMessage(`foobar`);
