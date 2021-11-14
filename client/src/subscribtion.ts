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

// function sendSubscription(subscription) {
//   return fetch(
//     `${
//       process.env.NODE_ENV === "production" ? apiProd : apiDev
//     }/notifications/subscribe`,
//     {
//       method: "POST",
//       body: JSON.stringify(subscription),
//       headers: {
//         "Content-Type": "application/json",
//       },
//     }
//   );
// }

// export function subscribeUser() {
//   if ("serviceWorker" in navigator) {
//     console.log("service worker is present");
//     navigator.serviceWorker.ready
//       .then(function (registration) {
//         console.log("service worker is ready");
//         if (!registration.pushManager) {
//           console.log("Push manager unavailable.");
//           return;
//         }

//         registration.pushManager
//           .getSubscription()
//           .then(function (existedSubscription) {
//             if (existedSubscription === null) {
//               console.log("No subscription detected, make a request.");
//               registration.pushManager
//                 .subscribe({
//                   applicationServerKey: convertedVapidKey,
//                   userVisibleOnly: true,
//                 })
//                 .then(function (newSubscription) {
//                   console.log("New subscription added.");
//                   sendSubscription(newSubscription);
//                 })
//                 .catch(function (e) {
//                   if (Notification.permission !== "granted") {
//                     console.log("Permission was not granted.");
//                   } else {
//                     console.error(
//                       "An error ocurred during the subscription process.",
//                       e
//                     );
//                   }
//                 });
//             } else {
//               console.log("Existed subscription detected.");
//               sendSubscription(existedSubscription);
//             }
//           });
//       })
//       .catch(function (e) {
//         console.error(
//           "An error ocurred during Service Worker registration.",
//           e
//         );
//       });
//   }
// }
