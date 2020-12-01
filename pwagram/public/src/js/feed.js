var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");
const form = document.querySelector("form");
const titleInput = document.querySelector("#title");
const locationInput = document.querySelector("#location");
const videoPlayer = document.querySelector("#player");
const canvas = document.querySelector("#canvas");
const captureButton = document.querySelector("#capture-btn");
const imagePicker = document.querySelector("#image-picker");
const imagePickerArea = document.querySelector("#pick-image");

function initializeMedia() {
  if (!("mediaDevices" in navigator)) {
    navigator.mediaDevices = {};
  }

  if (!("getUserMedia" in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
      const getUserMedia =
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if (!getUserMedia) {
        return Promise.reject(new Error("getUserMedia is not supported"));
      }

      return new Promise(function (resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }

  navigator.mediaDevices
    // .getUserMedia({ video: true, audio: true })
    .getUserMedia({ video: true })
    .then((stream) => {
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = "block";
    })
    .catch((err) => {
      imagePickerArea.style.display = "block";
    });
}

captureButton.addEventListener("click", (event) => {
  canvas.style.display = "block";
  videoPlayer.style.display = "none";
  captureButton.style.display = "none";
  const context = canvas.getContext("2d");
  context.drawImage(
    videoPlayer,
    0,
    0,
    canvas.width,
    (videoPlayer.videoHeight / videoPlayer.videoWidth) * canvas.width
  );
  videoPlayer.srcObject.getVideoTracks().forEach((track) => track.stop());
});

function openCreatePostModal() {
  // createPostArea.style.display = "block";
  // setTimeout(() => {
  //   createPostArea.style.transform = "translateY(0)";
  // }, 1);
  createPostArea.style.transform = "translateY(0)";
  initializeMedia();
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult) => {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === "dismissed") {
        console.log("User cancelled installation");
      } else {
        console.log("User added to home screen");
      }

      deferredPrompt = null;
    });
  }
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => registrations.forEach((r) => r.unregister()));
  }
}

function closeCreatePostModal() {
  // createPostArea.style.display = "none";
  createPostArea.style.transform = "translateY(100vh)";

  imagePickerArea.style.display = "none";
  videoPlayer.style.display = "none";
  canvas.style.display = "none";
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

function onSaveButtonClicked(event) {
  console.log("clicked");
  if ("caches" in window) {
    caches.open("user-requested").then((cache) => {
      cache.add("https://httpbin.org/get");
      cache.add("/src/images/sf-boat.jpg");
    });
  }
}

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
  var cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = `url(${data.image})`;
  cardTitle.style.backgroundSize = "cover";
  cardTitle.style.height = "180px";
  cardTitle.style.backgroundPosition = "bottom"; // Or try 'center'
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.style.color = "white";
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = "center";
  // var cardSaveButton = document.createElement("button");
  // cardSaveButton.textContent = "Save";
  // cardSaveButton.addEventListener("click", onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  clearCards();
  data.forEach(createCard);
}

// var url = "https://httpbin.org/get";
var url = "https://pwa-udemy-9d70f.firebaseio.com/posts.json";
var networkDataReceived = false;

fetch(url)
  //   , {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Accept: "application/json",
  //   },
  //   body: JSON.stringify({ message: "Some message" }),
  // })
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkDataReceived = true;
    console.log("from web", data);
    const dataArray = [];
    for (const key in data) {
      dataArray.push(data[key]);
    }
    // clearCards();
    // createCard();
    updateUI(dataArray);
  });

if ("indexedDB" in window) {
  readAllData("posts").then((data) => {
    if (!networkDataReceived) {
      console.log("From indexeDB", data);
      updateUI(data);
    }
  });
}

// if ("caches" in window) {
//   caches
//     .match(url)
//     .then((response) => {
//       if (response) {
//         return response.json();
//       }
//     })
//     .then((data) => {
//       if (!networkDataReceived) {
//         console.log("from cache", data);
//         // clearCards();
//         // createCard();
//         const dataArray = [];
//         for (const key in data) {
//           dataArray.push(data[key]);
//         }
//         updateUI(dataArray);
//       }
//     });
// }

function sendData() {
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
      image:
        "https://firebasestorage.googleapis.com/v0/b/pwa-udemy-9d70f.appspot.com/o/sf-boat.jpg?alt=media&token=bdc56969-742d-4ec6-a9cb-5aecd188f4ff",
    }),
  }).then((res) => {
    console.log("Send data", res);
    updateUI();
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (titleInput.value.trim() === "" || locationInput.value.trim() === "") {
    alert("Please enter valid data!");
    return;
  }

  closeCreatePostModal();

  if ("serviceWorker" in navigator && "SyncManager" in window) {
    console.log("rea1");
    navigator.serviceWorker.ready.then((sw) => {
      const post = {
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value,
      };
      writeData("sync-posts", post)
        .then(() => sw.sync.register("sync-new-post"))
        .then(() => {
          const snackbarContainer = document.querySelector(
            "#confirmation-post"
          );
          const data = { message: "Your post was saved for syncing!" };
          snackbarContainer.MaterialSnackbar.showSnackbar(data);
        })
        .catch(console.error);
    });
  } else {
    sendData();
  }
});
