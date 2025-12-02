
// ================================
// 📌 APP.JS — главный модуль приложения
// ================================

console.log("🟢 app.js загружен, жду user-ready");

document.addEventListener("user-ready", (e) => {
    const user = e.detail.user;
    console.log("🔥 app.js получил user-ready:", user);

    initializeApp(); 
});

async function initializeApp() {
    console.log("🚀 Запуск приложения...");

    // ==== ТЕМА ====
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") document.body.classList.add("dark");

    // ==== КАЛЕНДАРЬ ====
    if (typeof renderCalendar === "function") {
        console.log("📅 Запускаю renderCalendar()");
        renderCalendar();
    } else {
        console.error("❌ renderCalendar отсутствует");
    }

    // ==== КНОПКИ ====
    function setupButtons() {
    console.log("🟦 setupButtons: назначаем обработчики");

    // prev / next month
    document.getElementById("prevMonth").onclick = () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    };

    document.getElementById("nextMonth").onclick = () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    };

    // FAB
    let fabOpen = false;
    const fabMenu = document.getElementById("fabMenu");
    const fabOptions = document.getElementById("fabMenuOptions");

    if (fabMenu && fabOptions) {
        fabMenu.onclick = () => {
            fabOpen = !fabOpen;
            fabOptions.classList.toggle("hidden", !fabOpen);
        };
    }

    const today = new Date().toISOString().slice(0, 10);

    // Add Work
    const fabAddWork = document.getElementById("fabAddWork");
    if (fabAddWork) {
        fabAddWork.onclick = () => openWorkModal({ date: today });
    }

    // Add Task
    const fabAddTask = document.getElementById("fabAddTask");
    if (fabAddTask) {
        fabAddTask.onclick = () => openTaskModal({ date: today });
    }

    // Export
    const exportBtn = document.getElementById("exportWeekBtn");
    if (exportBtn) {
        exportBtn.onclick = () => {
            console.log("📤 Экспорт: кнопка нажата");
            exportWeekToExcelFromDate(today);
        };
    }

    console.log("🟩 setupButtons: завершено");
}

    setupButtons();
}


document.addEventListener("DOMContentLoaded", async () => {
    console.log("🚀 [APP] DOMContentLoaded — старт инициализации приложения");

    // 1️⃣ Попытка обработать восстановление (magic link, recovery)
    console.log("🔍 [AUTH] Пытаюсь выполнить handleRecoveryFromURL()");

    try {
        const recovered = await handleRecoveryFromURL();
        console.log("🔄 [AUTH] handleRecoveryFromURL() вернул:", recovered);

        if (recovered) {
            console.log("⏳ [AUTH] Завершение процесса восстановления… Останавливаю app.js");
            return;
        }
    } catch (err) {
        console.error("❌ [AUTH] Ошибка в handleRecoveryFromURL:", err);
    }

    // 2️⃣ Нормальная проверка авторизации
    console.log("🔍 [AUTH] Запуск checkAuth()");

    let authenticated = false;
    try {
        authenticated = await checkAuth();
        console.log("🔐 [AUTH] checkAuth() →", authenticated);
    } catch (err) {
        console.error("❌ [AUTH] Ошибка в checkAuth():", err);
    }

    if (!authenticated) {
        console.warn("⚠️ [AUTH] Пользователь не авторизован. Прерываю запуск приложения.");
        return;
    }

    console.log("✅ [AUTH] Пользователь авторизован — продолжаем запуск приложения");

    // 3️⃣ ТЕМА
    console.log("🎨 [THEME] Настраиваем тему");

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        console.log("🌙 [THEME] Темная тема включена");
        document.body.classList.add("dark");
    } else {
        console.log("☀️ [THEME] Светлая тема");
    }

    // 4️⃣ КАЛЕНДАРЬ
    console.log("📅 [CALENDAR] Готовимся отрисовать календарь");

    if (typeof renderCalendar !== "function") {
        console.error("❌ [CALENDAR] Функция renderCalendar НЕ найдена!");
    } else {
        try {
            console.log("📅 [CALENDAR] Запуск renderCalendar()");
            renderCalendar();
            console.log("🟩 [CALENDAR] renderCalendar() завершён");
        } catch (err) {
            console.error("❌ [CALENDAR] Ошибка в renderCalendar():", err);
        }
    }

    // Переключатели месяцев
    console.log("🔄 [CALENDAR] Назначаю обработчики переключения месяцев");

    const prevBtn = document.getElementById("prevMonth");
    const nextBtn = document.getElementById("nextMonth");

    if (prevBtn && nextBtn) {
        prevBtn.onclick = () => {
            console.log("⬅️ [CALENDAR] prevMonth clicked");
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        };

        nextBtn.onclick = () => {
            console.log("➡️ [CALENDAR] nextMonth clicked");
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        };
    } else {
        console.error("❌ [CALENDAR] prevMonth или nextMonth не найден в DOM");
    }

    // 5️⃣ FAB меню
    console.log("➕ [FAB] Инициализация FAB меню");

    const fabMenu = document.getElementById("fabMenu");
    const fabOptions = document.getElementById("fabMenuOptions");

    if (fabMenu && fabOptions) {
        let fabOpen = false;

        fabMenu.onclick = () => {
            fabOpen = !fabOpen;
            fabOptions.classList.toggle("hidden", !fabOpen);
            console.log("🔘 [FAB] fabOpen =", fabOpen);
        };

        document.getElementById("fabAddWork").onclick = () => {
            const date = new Date().toISOString().slice(0, 10);
            console.log("🛠️ [FAB] Добавить работу для:", date);
            openWorkModal({ date });
        };

        document.getElementById("fabAddTask").onclick = () => {
            const date = new Date().toISOString().slice(0, 10);
            console.log("📝 [FAB] Добавить задачу для:", date);
            openTaskModal({ date });
        };
    } else {
        console.error("❌ [FAB] fabMenu или fabMenuOptions не найден!");
    }

    // 6️⃣ Отчёты
    const reportsBtn = document.getElementById("reportsBtn");
    if (reportsBtn) {
        reportsBtn.onclick = () => {
            console.log("📊 [REPORTS] Открываю модалку отчётов");
            openModal("modalReports");
            if (fabOptions) fabOptions.classList.add("hidden");
        };
    }

    // 7️⃣ Переключатель темы
    const themeToggle = document.getElementById("darkToggle");
    if (themeToggle) {
        themeToggle.onclick = () => {
            document.body.classList.toggle("dark");
            const newTheme = document.body.classList.contains("dark") ? "dark" : "light";
            console.log("🎨 [THEME] Тема переключена:", newTheme);
            localStorage.setItem("theme", newTheme);
        };
    }

    // 8️⃣ Экспорт недели
    console.log("📤 [EXPORT] Инициализация кнопки экспорта недели");

    const exportBtn = document.getElementById("exportWeekBtn");

    if (exportBtn) {
        exportBtn.onclick = () => {
            console.log("📤 [EXPORT] Кнопка экспорта нажата");

            const today = new Date().toISOString().slice(0, 10);
            console.log("📤 [EXPORT] Экспортируем неделю начиная с:", today);

            if (typeof exportWeekToExcelFromDate !== "function") {
                console.error("❌ [EXPORT] Функция exportWeekToExcelFromDate НЕ найдена!");
                return;
            }

            try {
                exportWeekToExcelFromDate(today);
                console.log("📤 [EXPORT] Экспорт успешно запущен");
            } catch (err) {
                console.error("❌ [EXPORT] Ошибка экспорта:", err);
            }
        };
    } else {
        console.error("❌ [EXPORT] exportWeekBtn не найден в DOM");
    }

    console.log("🏁 [APP] Инициализация приложения завершена");
});
