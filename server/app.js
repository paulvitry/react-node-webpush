import express from "express";
import cors from "cors";
import webpush from "web-push";
import bodyParser from "body-parser";
import dotenv  from "dotenv"

dotenv.config();
const app = express();

const vapidKeys = {
  publicKey: process.env.PUBLIC_VAPID,
  privateKey: process.env.PRIVATE_VAPID,
};

webpush.setVapidDetails(
  "mailto:nn@gmail.org",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

var port = process.env.PORT || 80;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  console.log("Hello world");
  res.send("Hello world");
});

app.post("/notifications/subscribe", (req, res) => {
  console.log("[subscribe]", req.body)
  const subscription = req.body;

  // STORE THE SUBCRIPTION TOKEN TO SEND NOTIFICATION IN THE FUTURE

  const payload = JSON.stringify({
    title: "My super title",
    body: "Newsletter Available!",
    icon: "assets/main-page-logo-small-hat.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Go to the site",
      },
    ],
  });

  webpush.sendNotification(subscription, payload)
    .then((result) => console.log("send notifiaction result:", result))
    .catch((e) => console.log("send notification error: ", e.stack));
  res.status(200).json({ success: true });
});

console.log("server listening on port: ", port);
app.listen(port);
