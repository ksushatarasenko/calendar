const CACHE_NAME = "calendar-v1";

const FILES_TO_CACHE = [
    "/",
    "/index.html",

    // CSS
    "/css/style.css",

    // JS
    "/js/app.js",
    "/js/calendar.js",
    "/js/export_to_excel.js",
    "/js/open_day.js",
    "/js/reports.js",
    "/js/save_task.js",
    "/js/supabase.js",
    "/js/ui.js",

    // Дополнительные ресурсы если нужны
    "/manifest.json"
];

// ---- УСТАНОВКА SERVICE WORKER ----
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// ---- АКТИВАЦИЯ ----
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            )
        )
    );
    self.clients.claim();
});

// ---- ОБРАБОТКА ЗАПРОСОВ ----
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
