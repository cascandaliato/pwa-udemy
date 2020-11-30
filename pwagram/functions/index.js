const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const webpush = require("web-push");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

const serviceAccount = require("./pwagram-fb-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pwa-udemy-9d70f.firebaseio.com/",
});

exports.storePostData = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    functions.logger.info("Hello logs!", { structuredData: true });
    admin
      .database()
      .ref("posts")
      .push({
        id: request.body.id,
        title: request.body.title,
        location: request.body.location,
        image: request.body.image,
      })
      .then(() => {
        webpush.setVapidDetails(
          "mailto:foo@bar.com",
          "BPGomLXMPc8ZnoyTP5tmcM8_rMobhDtn98wPRyvlMfxEOhsSJMkwRYZkzno0pcH47APNCqaG9z5Fyz8euWCT4Ww",
          "tIP38fSwoN9cOsuX7x6Tbx5TBouP8MHXcPVRnvX6eUg"
        );
        return admin.database().ref("subscriptions").once("value");
      })
      .then((subscriptions) => {
        subscriptions.forEach((sub) => {
          const pushConfig = {
            endpoint: sub.val().endpoint,
            keys: { auth: sub.val().keys.auth, p256dh: sub.val().keys.p256dh },
          };
          webpush
            .sendNotification(
              pushConfig,
              JSON.stringify({
                title: "New Post",
                content: "New post added!",
                openUrl: "/help",
              })
            )
            .catch(console.error);
        });
        response
          .status(201)
          .json({ message: "Data stored", id: request.body.id });
      })
      .catch((error) => response.status(500).json({ error }));
  });
  // response.send("Hello from Firebase!");
});
