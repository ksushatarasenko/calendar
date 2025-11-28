//service-worker.js
self.addEventListener("install", e => {
    console.log("Service worker installed");
});

self.addEventListener("activate", e => {
    console.log("Service worker activated");
});

self.addEventListener("fetch", event => {
    event.respondWith(fetch(event.request));
});
