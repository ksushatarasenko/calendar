
// ===============================
// app.js — ГЛАВНЫЙ ФАЙЛ ПРИЛОЖЕНИЯ
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Приложение загружено");

    // восстановление темы
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
    }

    // ----------------------------------------
    // 📅 Рендер календаря при загрузке
    // ----------------------------------------
    renderCalendar();

    // ====================================
    // 🔵 Переключение месяцев
    // ====================================
    document.getElementById("prevMonth").onclick = () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    };

    document.getElementById("nextMonth").onclick = () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    };

    // ====================================
    // 🔄 Свайпы влево/вправо
    // ====================================
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    document.addEventListener("touchstart", e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    document.addEventListener("touchmove", e => {
        touchEndX = e.touches[0].clientX;
        touchEndY = e.touches[0].clientY;
    });

    document.addEventListener("touchend", () => {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // ✔ если вертикальное движение больше — это скролл
        if (Math.abs(deltaY) > Math.abs(deltaX)) return;

        // ✔ свайп вправо
        if (deltaX > 50) {
            prevMonth();
        }
        // ✔ свайп влево
        if (deltaX < -50) {
            nextMonth();
        }
    });


    // ====================================
    // ➕ FAB
    // ====================================
    let fabOpen = false;

    const fabMenu = document.getElementById("fabMenu");
    const fabOptions = document.getElementById("fabMenuOptions");
    const fabAddWork = document.getElementById("fabAddWork");
    const fabAddTask = document.getElementById("fabAddTask");

    fabMenu.onclick = () => {
        fabOpen = !fabOpen;
        fabOptions.classList.toggle("hidden", !fabOpen);
    };

    const setSelectedToday = () => {
        selectedDate = new Date().toISOString().slice(0, 10);
    };

    fabAddWork.onclick = () => {
        setSelectedToday();
        closeModal("modalDay");
        openWorkModal({ date: selectedDate });
        fabOptions.classList.add("hidden");
        fabOpen = false;
    };

    fabAddTask.onclick = () => {
        setSelectedToday();
        closeModal("modalDay");
        openTaskModal({ date: selectedDate });
        fabOptions.classList.add("hidden");
        fabOpen = false;
    };

    // ====================================
    // 📤 Экспорт недели
    // ====================================
    const btnWeeklyExcel = document.getElementById("exportWeekBtn");
    if (btnWeeklyExcel) {
        btnWeeklyExcel.onclick = () => {
            const base = selectedDate || new Date().toISOString().slice(0, 10);
            exportWeekToExcelFromDate(base);
        };
    }

    // ====================================
    // 🌙 ТЕМА
    // ====================================
    const darkToggleBtn = document.getElementById("darkToggle");

    if (darkToggleBtn) {
        darkToggleBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark");

            localStorage.setItem(
                "theme",
                document.body.classList.contains("dark") ? "dark" : "light"
            );
        });
    }
    else {
        console.warn("❗ Кнопка darkToggle не найдена");
    }

    // ====================================
    // 📄 Отчёты
    // ====================================
    document.getElementById("reportsBtn").onclick = () => {
        openModal("modalReports");
        fabOptions.classList.add("hidden");
        fabOpen = false;
    };
});

