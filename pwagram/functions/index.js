const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const webpush = require("web-push");
const formidable = require("formidable");
const fs = require("fs");
const UUID = require("uuid-v4");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

const serviceAccount = require("./pwagram-fb-key.json");

const gcConfig = { projectId: "", keyFilename: "pwagram-fb-key.json" };
const gcStorage = require("@google-cloud/storage")(gcConfig);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pwa-udemy-9d70f.firebaseio.com/",
});

exports.storePostData = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    const uuid = UUID();

    const formData = new formidable.IncomingForm();
    formData.parse(request, function (err, fields, files) {
      fs.rename(files.file.path, "/tmp/" + files.file.name);
      const bucket = gcStorage.bucket("pwafram-99adf.appspot.com");
      bucket.upload(
        "/tmp/" + files.file.name,
        {
          uploadType: "media",
          metadata: {
            metadata: {
              contentType: files.file.type,
              firebaseStorageDownloadTokens: uuid,
            },
          },
        },
        (err, file) => {
          if (!err) {
            functions.logger.info("Hello logs!", { structuredData: true });
            admin
              .database()
              .ref("posts")
              .push({
                id: fields.id,
                title: fields.title,
                location: fields.location,
                rawLocation: {
                  lat: fields.rawLocationLat,
                  lng: rawLocationLng,
                },
                image:
                  "https://firebasestorage.googleapis.com/v0/b/" +
                  bucket.name +
                  "/o/" +
                  encodeURIComponent(file.name) +
                  "?alt=media&token=" +
                  uuid,
                // id: request.body.id,
                // title: request.body.title,
                // location: request.body.location,
                // image: request.body.image,
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
                    keys: {
                      auth: sub.val().keys.auth,
                      p256dh: sub.val().keys.p256dh,
                    },
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
                  // .json({ message: "Data stored", id: request.body.id });
                  .json({ message: "Data stored", id: fields.id });
              })
              .catch((error) => response.status(500).json({ error }));
          } else {
            console.error(err);
          }
        }
      );
    });
  });
  // response.send("Hello from Firebase!");
});
