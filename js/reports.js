// reports.js
// =======================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =======================================

// Получение диапазона текущего месяца
function getMonthRange() {
    const baseDate = selectedDate || new Date().toISOString().slice(0, 10);
    const d = new Date(baseDate);

    const year = d.getFullYear();
    const month = d.getMonth();

    const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDay = new Date(year, month + 1, 0).getDate();
    const end = `${year}-${String(month + 1).padStart(2, "0")}-${endDay}`;

    return { year, month, start, end };
}

// Показывает результат отчёта в отдельном окне
function showReportResult(title, html) {
    document.getElementById("reportTitle").textContent = title;
    document.getElementById("reportContent").innerHTML = html;

    closeModal("modalReports");     
    openModal("modalReportOutput"); 
}

// =======================================
// ОТЧЁТ ПО СМЕНАМ
// =======================================
async function showMonthlyWorkReport() {
    const { start, end } = getMonthRange();

    const { data, error } = await supabaseClient
        .from("work_entries")
        .select("*")
        .gte("date", start)
        .lte("date", end)
        .order("date");

    if (error) {
        console.error("❌ Ошибка отчёта смен:", error);
        return;
    }

    let totalHours = 0;

    let html = `
        <table class="report-table">
            <tr>
                <th>Дата</th>
                <th>Часы</th>
                <th>Место</th>
                <th>С кем</th>
            </tr>
    `;

    data.forEach(w => {
        totalHours += Number(w.total_hours);

        html += `
            <tr>
                <td>${w.date}</td>
                <td>${w.total_hours}</td>
                <td>${w.place}</td>
                <td>${w.partner}</td>
            </tr>
        `;
    });

    html += `
        </table>
        <h3 style="margin-top:15px;">ИТОГО: ${totalHours.toFixed(1)} часов за месяц</h3>
    `;

    showReportResult("Отчёт по сменам", html);
}

// =======================================
// ОТЧЁТ ПО ЗАДАЧАМ
// =======================================
async function showMonthlyTasksReport() {
    const { start, end } = getMonthRange();

    const { data, error } = await supabaseClient
        .from("tasks")
        .select("*")
        .gte("date", start)
        .lte("date", end)
        .order("date");

    if (error) {
        console.error("❌ Ошибка отчёта задач:", error);
        return;
    }

    let html = `
        <table class="report-table">
            <tr>
                <th>Дата</th>
                <th>Время</th>
                <th>Задача</th>
                <th>Описание</th>
                <th>Статус</th>
            </tr>
    `;

    data.forEach(t => {
        html += `
            <tr>
                <td>${t.date}</td>
                <td>${t.time || "-"}</td>
                <td>${t.title}</td>
                <td>${t.description || ""}</td>
                <td>${t.completed ? "✔ Выполнено" : "❌ Нет"}</td>
            </tr>
        `;
    });

    html += "</table>";

    showReportResult("Отчёт по задачам", html);
}

// =======================================
// КНОПКИ
// =======================================

document.getElementById("btnReportWork").onclick = showMonthlyWorkReport;
document.getElementById("btnReportTasks").onclick = showMonthlyTasksReport;