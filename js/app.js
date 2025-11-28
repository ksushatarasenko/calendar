//js/app.js
// ===============================
// app.js — ГЛАВНЫЙ ФАЙЛ ПРИЛОЖЕНИЯ
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Приложение загружено");

    // Рендер календаря при загрузке
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

    // Свайпы (лево/право)

    let touchStartX = 0;

    document.addEventListener("touchstart", e => {
        touchStartX = e.changedTouches[0].clientX;
    });

    document.addEventListener("touchend", e => {
        const dx = e.changedTouches[0].clientX - touchStartX;

        if (dx > 80) {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        }

        if (dx < -80) {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        }
    });


    // ====================================
    // 🔵 FAB меню (кнопка "+")
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

    // Удобный хелпер — ставим сегодняшнюю дату
    function setSelectedToday() {
        selectedDate = new Date().toISOString().slice(0, 10);
    }

    // Добавить смену
    fabAddWork.onclick = () => {
        setSelectedToday();
        closeModal("modalDay");
        openWorkModal({ date: selectedDate });
        fabOptions.classList.add("hidden");
        fabOpen = false;
    };

    // Добавить задачу
    fabAddTask.onclick = () => {
        setSelectedToday();
        closeModal("modalDay");
        openTaskModal({ date: selectedDate });
        fabOptions.classList.add("hidden");
        fabOpen = false;
    };

    // ====================================
    // 🔵 Кнопка "Отчёты"
    // ====================================
    document.getElementById("reportsBtn").onclick = () => {
        openModal("modalReports");
        fabOptions.classList.add("hidden");
        fabOpen = false;
    };

    // ====================================
    // 🔵 Экспорт недели в Excel
    // ====================================
    const btnWeeklyExcel = document.getElementById("exportWeekBtn");
    if (btnWeeklyExcel) {
        btnWeeklyExcel.onclick = () => {
            const base = selectedDate || new Date().toISOString().slice(0, 10);
            exportWeekToExcelFromDate(base);
        };
    }
});


// ===================================================
// 🔵 Утилита — расчёт часов
// ===================================================
function calculateHours(start, end) {
    if (!start || !end) return 0;
    const [h1, m1] = start.split(":").map(Number);
    const [h2, m2] = end.split(":").map(Number);
    const diff = (h2 - h1) + (m2 - m1) / 60;
    return diff.toFixed(1);
}


// ===================================================
// 🔵 КНОПКА "Сохранить смену"
// ===================================================
document.getElementById("saveWork").onclick = async () => {
    const entry = {
        id: document.getElementById("workId").value || null,
        date: document.getElementById("workDate").value || selectedDate,
        start_time: document.getElementById("workStart").value,
        end_time: document.getElementById("workEnd").value,
        place: document.getElementById("workPlace").value,
        partner: document.getElementById("workPartner").value
    };

    entry.total_hours = calculateHours(entry.start_time, entry.end_time);

    await saveWorkEntry(entry);
    closeModal("modalWork");
    renderCalendar();
};


// ===================================================
// 🔵 КНОПКА "Удалить смену"
// ===================================================
document.getElementById("deleteWork").onclick = async () => {
    const id = document.getElementById("workId").value;
    if (!id) return;

    if (confirm("Удалить смену?")) {
        await deleteWorkEntry(id);
        closeModal("modalWork");
        renderCalendar();
    }
};


// ===================================================
// 🔵 КНОПКА "Сохранить задачу"
// ===================================================
document.getElementById("saveTask").onclick = async () => {
    const task = {
        id: document.getElementById("taskId").value || null,
        date: document.getElementById("taskDate").value || selectedDate,
        time: document.getElementById("taskTime").value,
        title: document.getElementById("taskTitle").value,
        description: document.getElementById("taskDescription").value
    };

    await saveTaskToDB(task);
    closeModal("modalTask");
    renderCalendar();
};


// ===================================================
// 🔵 КНОПКА "Удалить задачу"
// ===================================================
document.getElementById("deleteTask").onclick = async () => {
    const id = document.getElementById("taskId").value;
    if (!id) return;

    if (confirm("Удалить задачу?")) {
        await deleteTask(id);
        closeModal("modalTask");
        renderCalendar();
    }
};

// переключатель темы
document.getElementById("themeToggle").onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
};

// загрузка темы при старте
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}