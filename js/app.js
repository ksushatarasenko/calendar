
// app.js — главный файл приложения
document.addEventListener("DOMContentLoaded", async () => {
    console.log("🚀 app.js loaded");

    // 1. Пробуем обработать URL восстановления
    const recovered = await handleRecoveryFromURL();
    if (recovered) {
        console.log("⏳ Recovery in progress");
        return;
    }

    // 2. Обычная проверка авторизации
    const ok = await checkAuth();
    if (!ok) return;

    console.log("✅ User authorized — continue app init");

    // === Тема ===
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") document.body.classList.add("dark");

    // === Календарь ===
    if (typeof renderCalendar === "function") {
        renderCalendar();
    }

    // === Переключение месяцев ===
    document.getElementById("prevMonth").onclick = () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    };

    document.getElementById("nextMonth").onclick = () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    };

    // === FAB ===
    let fabOpen = false;
    const fabMenu = document.getElementById("fabMenu");
    const fabOptions = document.getElementById("fabMenuOptions");

    fabMenu.onclick = () => {
        fabOpen = !fabOpen;
        fabOptions.classList.toggle("hidden", !fabOpen);
    };

    document.getElementById("fabAddWork").onclick = () => {
        const date = new Date().toISOString().slice(0,10);
        openWorkModal({ date });
    };

    document.getElementById("fabAddTask").onclick = () => {
        const date = new Date().toISOString().slice(0,10);
        openTaskModal({ date });
    };

    // === Отчёты ===
    document.getElementById("reportsBtn").onclick = () => {
        openModal("modalReports");
        fabOptions.classList.add("hidden");
    };

    // === Тёмная тема ===
    document.getElementById("darkToggle").onclick = () => {
        document.body.classList.toggle("dark");
        localStorage.setItem("theme",
            document.body.classList.contains("dark") ? "dark" : "light"
        );
    };
});
