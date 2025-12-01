// =============================================================
// export_to_exel.js — Экспорт данных в Excel
// Полностью переписанная версия (2025)
// Автор: ChatGPT
// =============================================================

// Проверка загрузки XLSX
console.log("📄 export_to_exel.js загружен");


// =============================================================
// 1. Открытие модального окна экспорта
// =============================================================

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("exportWeekBtn");
    if (!btn) {
        console.error("❌ exportWeekBtn не найден в DOM!");
        return;
    }

    btn.onclick = () => {
        console.log("📤 КНОПКА ЭКСПОРТ НАЖАТА!");
        openModal("modalExport");
    };

    // кнопка EXCEL внутри модалки
    const btnDownload = document.getElementById("exportDownloadBtn");
    if (btnDownload) {
        btnDownload.onclick = handleExportDownload;
    }
});


// =============================================================
// 2. Обработчик кнопки "Скачать Excel"
// =============================================================

async function handleExportDownload() {
    console.log("📥 Начинаем экспорт диапазона…");

    const from = document.getElementById("exportFrom").value;
    const to   = document.getElementById("exportTo").value;
console.log("📅 Даты:", from, to);
    if (!from || !to) {
        alert("Выберите обе даты!");
        return;
    }

    console.log(`📅 Формируем отчёт: ${from} → ${to}`);

    try {
        await exportCustomRange(from, to);
        closeModal("modalExport");
    } catch (err) {
        console.error("❌ Ошибка при экспорте:", err);
        alert("Произошла ошибка экспорта. См. консоль.");
    }
}


// =============================================================
// 3. Основная функция экспорта Excel
// =============================================================

async function exportCustomRange(from, to) {
    console.log("🔎 Загружаем данные из Supabase…");

    // Загружаем смены
    const { data: workRows, error: workErr } = await supabaseClient
        .from("work_entries")
        .select("*")
        .gte("date", from)
        .lte("date", to)
        .order("date", { ascending: true });

    // Загружаем задачи
    const { data: taskRows, error: taskErr } = await supabaseClient
        .from("tasks")
        .select("*")
        .gte("date", from)
        .lte("date", to)
        .order("date", { ascending: true });

    if (workErr || taskErr) {
        console.error("❌ Ошибка Supabase:", workErr || taskErr);
        throw new Error("Ошибка загрузки данных Supabase");
    }

    console.log(`📋 Найдено: смен — ${workRows.length}, задач — ${taskRows.length}`);

    // Создаём Excel
    const workbook = XLSX.utils.book_new();


    // =============================================================
    // 3.1 Формирование вкладки "Works" (Смены)
    // =============================================================

    const worksForSheet = workRows.map(w => ({
        Date: w.date,
        Start: w.start_time,
        End: w.end_time,
        Hours: Number(w.total_hours).toFixed(2),
        Place: w.place,
        Partner: w.partner,
        Note: w.note ?? ""
    }));

    const wsWorks = XLSX.utils.json_to_sheet(
        worksForSheet.length > 0 ? worksForSheet : [{ Info: "Нет смен за период" }]
    );

    autoSizeColumns(wsWorks);
    XLSX.utils.book_append_sheet(workbook, wsWorks, "Works");


    // =============================================================
    // 3.2 Формирование вкладки "Tasks" (Задачи)
    // =============================================================

    const tasksForSheet = taskRows.map(t => ({
        Date: t.date,
        Time: t.time,
        Title: t.title,
        Description: t.description ?? "",
        Completed: t.completed ? "YES" : "NO"
    }));

    const wsTasks = XLSX.utils.json_to_sheet(
        tasksForSheet.length > 0 ? tasksForSheet : [{ Info: "Нет задач за период" }]
    );

    autoSizeColumns(wsTasks);
    XLSX.utils.book_append_sheet(workbook, wsTasks, "Tasks");


    // =============================================================
    // 3.3 Сохраняем Excel
    // =============================================================

    const filename = `report_${from}_to_${to}.xlsx`;
    XLSX.writeFile(workbook, filename);

    console.log("✅ Экспорт успешно завершён:", filename);
}


// =============================================================
// 4. Хелпер — автоширина колонок Excel
// =============================================================

function autoSizeColumns(ws) {
    const cols = [];

    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

    if (!data.length) return;

    data[0].forEach((_, colIndex) => {
        let maxWidth = 10;
        data.forEach(row => {
            const cell = row[colIndex];
            if (!cell) return;

            const width = cell.toString().length + 2;
            if (width > maxWidth) maxWidth = width;
        });

        cols.push({ wch: maxWidth });
    });

    ws['!cols'] = cols;
}
