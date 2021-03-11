importScripts('https://www.gstatic.com/firebasejs/8.2.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.1/firebase-messaging.js');
var firebaseConfig = {
    apiKey: "AIzaSyC4rGPo9XW56R4rGOXXhmXGuL_eZ0fvAQo",
    authDomain: "quizinato.firebaseapp.com",
    databaseURL: "https://quizinato-default-rtdb.firebaseio.com",
    projectId: "quizinato",
    storageBucket: "quizinato.appspot.com",
    messagingSenderId: "823687668145",
    appId: "1:823687668145:web:bf0d6b69e1f2a0f1f81d90",
    measurementId: "G-WPV4QGR06F"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
    console.log('Received background message ', payload);
    var notification = JSON.parse(payload.data.notification);
    const notificationTitle = notification.stat == 0 ? "Challenge RECEIVED" : "Challenge RESULTS";
    const notificationOptions = {
        body: notification.stat == 0 ? (notification.user + " has challenged you in " + notification.categ) :
            (notification.user + " has completed your challenge in " + notification.categ),
        icon: "https://quizinato.web.app/icons/logo-small.png",
        actions: [
            { action: 'b', title: 'VIEW👍' },
            { action: 'a', title: 'LATER⏰' }
        ]
    };

    return self.registration.showNotification(notificationTitle,
        notificationOptions);
});

self.addEventListener('notificationclick', function (event) {

    event.notification.close();

    if (event.action == 'a') {
        clients.openWindow("https://quizinato.web.app?notif=1")
        return;
    }
    else if (event.action == 'b') {
        return;
    }
    clients.openWindow("https://quizinato.web.app?notif=1");
}, false);

this.addEventListener('fetch', function (event) {
    // it can be empty if you just want to get rid of that error
});