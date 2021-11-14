# react-node-webpush

This is a simple PWA with webpush notifications using reactJS and nodeJS.

# Try it!

https://agitated-shirley-a0cc07.netlify.app

# Create your app

    npx create-react-app client --template cra-template-pwa-typescript

# Register service-worker
Go to client/src/index.tsx and turn unregister() to register()

# Create a new service-worker
Go to service-worker.ts and at the end of the file add the following code:

    self.addEventListener("push", (event) => {
      const data = event?.data!.json();
      console.log("New notification", data);
      const options = {
        ...data
      };
      event.waitUntil(
          self.registration.showNotification(data.title, options)
      );
    });

# Create .env file

Create a .env file and add the following

    REACT_APP_PUBLIC_VAPID='your_public_vapid_key'
    REACT_APP_ENDPOINT_DEV='http://localhost:80'
    REACT_APP_ENDPOINT_PROD='http://localhost:80'

# Create subscription.ts

Create subscription.ts file and add the following code inside:

    const convertedVapidKey = urlBase64ToUint8Array(
      process.env.REACT_APP_PUBLIC_VAPID!
    );

    function urlBase64ToUint8Array(base64String: string) {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      // eslint-disable-next-line
      const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }

    export async function getToken() {
      let token = undefined;
      if ("serviceWorker" in navigator) {
        await navigator.serviceWorker.ready
          .then(async function (registration) {
            if (!registration.pushManager) {
              return;
            }
            token = await registration.pushManager
              .getSubscription()
              .then(async function (existedSubscription) {
                if (existedSubscription === null) {
                  console.log("No subscription detected, make a request.");
                  token = await registration.pushManager
                    .subscribe({
                      applicationServerKey: convertedVapidKey,
                      userVisibleOnly: true,
                    })
                    .then(function (newSubscription) {
                      console.log("New subscription added.");
                      return newSubscription;
                    })
                    .catch(function (e) {
                      if (Notification.permission !== "granted") {
                        console.log("Permission was not granted.");
                      } else {
                        console.error(
                          "An error ocurred during the subscription process.",
                          e
                        );
                      }
                    });
                } else {
                  return existedSubscription;
                }
              });
          })
          .catch(function (e) {
            console.error(
              "An error ocurred during Service Worker registration.",
              e
            );
          });
        return token;
      }
    }

# Modify App.tsx

Install axios

    yarn add axios

Replace the content of App.tsx by the following code:

    import React, { useState } from "react";
    import logo from "./logo.svg";
    import "./App.css";
    import { getToken } from "./subscribtion";
    import Axios from "axios";

    function App() {
      const [data, setData] = useState("");
      const endpoint =
        process.env.NODE_ENV === "production"
          ? process.env.REACT_APP_ENDPOINT_PROD
          : process.env.REACT_APP_ENDPOINT_DEV;

      const getHelloWorld = async () => {
        Axios.get(endpoint + "/")
          .then((res: any) => {
            setData(res.data);
            console.log(res);
          })
          .catch((err: any) => console.log(err));
      };

      const notify = async () => {
        getToken().then(async (token) => {
          const response = await fetch(endpoint + "/notifications/subscribe", {
            method: "POST",
            body: JSON.stringify(token),
            headers: {
              "Content-Type": "application/json",
            },
          }).catch((err: any) => console.log(err));
          console.log(response);
        });
      };

      return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
              Edit <code>src/App.tsx</code> and save to reload.
            </p>

            <button
              onClick={() => {
                getHelloWorld();
              }}
            >
              getHelloWorld
            </button>
            <button
              onClick={() => {
                notify();
              }}
            >
              notify
            </button>
            <div>{`Data: ${data}`}</div>
          </header>
        </div>
      );
    }

    export default App;


# Create a server
Now we've created client side, go back to the root of the project. Create a new folder named server and create the server.

    mkdir server ; cd server ; yarn init ; yarn add express cors web-push body-parser dotenv
    yarn add --dev nodemon
    touch app.js

Add the following code in app.js:

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

# Edit package.json

Add the following inside package.json

    "type": "module",
    "scripts": {
      "start:dev": "nodemon app.js --exec",
      "start": "node app.js"
    },

# Create .env file

Create a .env file and add the following

    PORT=80
    PUBLIC_VAPID='your_public_vapid_key'
    PRIVATE_VAPID='your_private_vapid_key'

# Generate VAPID keys

Replace the vapid key in all .env with keys you generated.

    const vapidKeys = webpush.generateVAPIDKeys();
    console.log(vapidKeys);

# Start the server

To start the server you can use the following

    yarn start:dev

# Deploy your client
Here we will be using netlify:
https://www.netlify.com/

First create a build of your app using the follwing command:

    yarn build

Drag and Drop the build folder inside netlify to deploy your app.

Go to the deployed website and click on notify.



