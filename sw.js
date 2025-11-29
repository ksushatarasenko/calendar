// =========================================
// sw.js — ОДИНСТВЕННЫЙ Service Worker
// =========================================

// Имя кеша (поменяй номер при обновлении)
const CACHE_NAME = "workcalendar-v1";

// Какие файлы кешировать
const ASSETS = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/app.js",
  "/js/calendar.js",
  "/js/open_day.js",
  "/js/save_task.js",
  "/js/reports.js",
  "/js/supabase.js",
  "/js/export_to_exel.js",
  "/js/ui.js",
  "/js/libs/xlsx.full.min.js",
  "/manifest.json"
];

// =========================================
// Установка Service Worker
// =========================================
self.addEventListener("install", event => {
  console.log("📥 SW: install");

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("📦 Кеширование файлов");
      return cache.addAll(ASSETS);
    })
  );

  self.skipWaiting(); // применить сразу
});

// =========================================
// Активация
// Удаляем старые кеши
// =========================================
self.addEventListener("activate", event => {
  console.log("♻ SW: activate");

  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log("🗑 Удаляю старый кеш:", key);
            return caches.delete(key);
          })
      )
    )
  );

  self.clients.claim(); // перехватываем вкладки
});

// =========================================
// Перехват запросов
// 1. Сначала ищем в кеше
// 2. Если нет — качаем из сети
// =========================================
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).catch(() =>
          // Можно добавить offline-страницу, но пока просто failback
          new Response("Offline", { status: 503 })
        )
      );
    })
  );
});
