// =====================================================
// Service Worker — исправленный и оптимизированный
// =====================================================

// Меняй при каждом обновлении ресурсов
const CACHE_NAME = "workcalendar-v5";

// Оффлайн-ресурсы (минимальный набор)
const ASSETS = [
  "/",
  "/index.html",
  "/css/styles.css",
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

// =====================================================
// INSTALL — создаём кеш
// =====================================================
self.addEventListener("install", event => {
  console.log("📥 SW: install");

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("📦 Кеширую ASSETS…");
      return cache.addAll(ASSETS);
    })
  );

  self.skipWaiting();
});

// =====================================================
// ACTIVATE — чистим старый кеш
// =====================================================
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

  self.clients.claim();
});

// =====================================================
// FETCH — лучшая стратегия для разработки:
// CSS / JS / HTML → network first
// остальное → cache first
// =====================================================
self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);

  // ---------- NETWORK FIRST для важных файлов ----------
  const isDynamicFile =
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".html") ||
    url.pathname === "/";

  if (isDynamicFile) {
    event.respondWith(
      fetch(req)
        .then(res => {
          // обновляем кеш новой версией
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // ---------- CACHE FIRST для статики ----------
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});
