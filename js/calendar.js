
//js/calendar.js
// ===============================
// calendar.js — КАЛЕНДАРЬ
// ===============================

// Глобально выбранная дата
let selectedDate = null;

// DOM элементы
const calendarGrid = document.getElementById("calendarGrid");
const monthTitle = document.getElementById("monthTitle");

// Текущий отображаемый месяц
let currentDate = new Date();

const weekdays = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

const weekdayHeader = document.getElementById("weekdayHeader");
weekdayHeader.innerHTML = "";

weekdays.forEach(w => {
    const el = document.createElement("div");
    el.classList.add("weekday");
    el.textContent = w;
    weekdayHeader.appendChild(el);
});

// ===============================
// 📅 Главная функция рендера календаря
// ===============================
async function renderCalendar() {
    console.log("🔄 renderCalendar()");

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Заголовок месяца
    monthTitle.textContent = currentDate
        .toLocaleString("pl-PL", { month: "long", year: "numeric" })
        .toUpperCase();

    // Начальный день недели
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
    // Кол-во дней в месяце
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Очищаем календарь
    calendarGrid.innerHTML = "";

    // ===============================
    // 🔥 Загружаем месяц одним запросом
    // ===============================
    const monthWork = await loadWorkForMonth(year, month);
    const monthTasks = await loadTasksForMonth(year, month);

    // ===============================
    // Пустые ячейки перед началом месяца
    // ===============================
    // предыдущее число месяца
    const prevMonthDays = new Date(year, month, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const dayNum = prevMonthDays - firstDay + i + 1;
        const cell = document.createElement("div");

        cell.classList.add("day-card", "day-disabled");
        cell.textContent = dayNum;

        calendarGrid.appendChild(cell);
    }

    // 

    // ===============================
    // 📅 Генерация карточек дней
    // ===============================
    for (let day = 1; day <= daysInMonth; day++) {
        const fullDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const card = document.createElement("div");
        card.classList.add("day-card");

        // Число дня
        const num = document.createElement("div");
        num.textContent = day;
        num.classList.add("day-number");
        card.appendChild(num);

        // 🔵 Данные за день
        const work = monthWork[fullDate] || [];
        const tasks = monthTasks[fullDate] || [];
        // текущий день подсвечивается
        const today = new Date().toISOString().slice(0, 10);
        if (fullDate === today) {
            card.classList.add("day-today");
        }

        // вычисление в конце месяца общего количества часов
        let totalHours = 0;

        Object.values(monthWork).forEach(entries => {
            entries.forEach(w => {
                totalHours += Number(w.total_hours || 0);
            });
        });

        document.getElementById("monthSummary").textContent =
            `Łącznie godzin: ${totalHours.toFixed(1)}`;



        // ===============================
        // 🧱 Смена (если есть)
        // ===============================
        if (work.length > 0) {
            const w = work[0];
            const info = document.createElement("div");
            info.classList.add("day-info");

            info.innerHTML = `
        <div class="work-badge">⏱ ${w.total_hours}h</div>
        <div style="margin-top:3px">${w.place}</div>
    `;

            card.appendChild(info);
        }

        // ===============================
        // 🟢 Точка задач
        // ===============================
        const dot = document.createElement("div");
        dot.classList.add("task-dot");

        if (tasks.length > 0) {
            dot.style.display = "block";
            dot.classList.add(tasks.some(t => !t.completed) ? "green" : "gray");
        }


        card.appendChild(dot);

        // ===============================
        // 📌 Клик на день
        // ===============================
        card.onclick = () => openDayModal(year, month, day);

        calendarGrid.appendChild(card);
    }
    // После цикла дней месяца: необходимые пустые ячейки в конце месяца
    const totalCells = firstDay + daysInMonth;
    const nextDays = 42 - totalCells; // 6 недель по 7 дней

    for (let i = 1; i <= nextDays; i++) {
        const cell = document.createElement("div");
        cell.classList.add("day-card", "day-disabled");
        cell.textContent = i;
        calendarGrid.appendChild(cell);
    }


    console.log("✔ Календарь отрисован");
}