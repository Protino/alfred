/**
 * Created by Gurupad Mamadapur on 14/04/20
 */

importScripts("https://www.gstatic.com/firebasejs/7.12.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/7.12.0/firebase-messaging.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyB5nkJ_B0EXimLfkKjzc68HRjzo5GdYVmA",
  authDomain: "alfred-property-app.firebaseapp.com",
  databaseURL: "https://alfred-property-app.firebaseio.com",
  projectId: "alfred-property-app",
  storageBucket: "alfred-property-app.appspot.com",
  messagingSenderId: "159800305096",
  appId: "1:159800305096:web:aab2bccda8911a9959ccfd",
};

var result = firebase.initializeApp(firebaseConfig);

console.log("[firebase-messaging-sw.js] initialized");

const messaging = firebase.messaging();
messaging.setBackgroundMessageHandler(function (payload) {

  const data = JSON.parse(payload.data.message) // Actual data

  console.log("Parsed payload", data)
  // TODO: Don't show notifications in case of topics
  return self.registration.showNotification(
    data.taskTitle,
    constructNotificationOptions(data)
  );
});

function constructNotificationOptions(data) {
  return (notificationOptions = {
    body: data.message,
    icon: "./favicon.ico",
    data: {
      type: data.task,
      bookingId: data.bookingId,
      notificationId: data.id,
    },
  });
}

self.addEventListener("notificationclick", function (event) {
  const notificationData = event.notification.data;

  const queryParams = new URLSearchParams();
  if (notificationData.id != null) {
    queryParams.append("notificationId", notificationData.id);
  }

  if (notificationData.bookingId != null) {
    queryParams.append("bookingId", notificationData.bookingId);
  }

  const notificationPath = `notification-click/${
    notificationData.type ?? ""
  }?${queryParams.toString()}`;

  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        // If so, just focus it.
        const clientHostName = new URL(client.url).hostname;
        if (
          ["app.fabmailers.in", "localhost"].some(
            (validHost) => clientHostName === validHost
          ) &&
          "focus" in client
        ) {
          return client
            .navigate("https://app.fabmailers.in/pms/#/" + notificationPath)
            .then((client) => client.focus());
        }
      }

      // If not, then open the target URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(
          "https://app.fabmailers.in/pms/#/" + notificationPath
        );
      }
    })
  );
});
