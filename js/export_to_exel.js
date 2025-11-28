// js/export_to_exel.js
// =====================
// Экспорт записей (смен + задач) за неделю в Excel
// Требования:
// - На странице должен быть загружен глобальный объект `supabaseClient`
// - На странице должна быть подключена библиотека XLSX (xlsx.full.min.js)
// - Этот файл должен подключаться ДО app.js (чтобы app.js мог вызывать функцию)
// =====================

console.log("📦 export_to_exel.js загружен");

// ---------------------
// Проверки зависимостей
// ---------------------
if (typeof supabaseClient === "undefined") {
  console.warn("⚠️ supabaseClient не найден. Убедитесь, что js/supabase.js подключён ДО export_to_exel.js");
}

if (typeof window.XLSX === "undefined") {
  console.warn("⚠️ XLSX не найден. Убедитесь, что библиотека xlsx.full.min.js подключена ДО export_to_exel.js");
}

// ---------------------
// Утилита: диапазон недели (понедельник — воскресенье) по дате YYYY-MM-DD
// ---------------------
function getWeekRange(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) throw new Error("Неверная дата в getWeekRange: " + dateStr);
  d.setHours(0,0,0,0);

  // (d.getDay() + 6) % 7 — приводит 0..6 так, чтобы 0 = понедельник
  const day = (d.getDay() + 6) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - day);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = dt => dt.toISOString().slice(0,10);
  return { from: fmt(monday), to: fmt(sunday) };
}

// ---------------------
// Загружаем записи за неделю из Supabase
// Возвращаем массив агрегированных строк: { type: "work" | "task", ... }
// ---------------------
async function fetchEntriesForWeek(dateStr) {
  if (typeof supabaseClient === "undefined") {
    throw new Error("supabaseClient не определён. Невозможно загрузить данные.");
  }

  const { from, to } = getWeekRange(dateStr);
  console.log("📥 fetchEntriesForWeek:", from, "→", to);

  // Оборачиваем в try/catch чтобы возвращать понятную ошибку наверх
  try {
    const { data: works, error: workErr } = await supabaseClient
      .from("work_entries")
      .select("*")
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: true });

    if (workErr) throw workErr;

    const { data: tasks, error: taskErr } = await supabaseClient
      .from("tasks")
      .select("*")
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (taskErr) throw taskErr;

    const rows = [];

    for (const w of works || []) {
      rows.push({
        type: "work",
        date: w.date,
        start: w.start_time || "",
        end: w.end_time || "",
        hours: (w.total_hours == null) ? "" : Number(w.total_hours),
        place: w.place || "",
        partner: w.partner || "",
        note: w.note || ""
      });
    }

    for (const t of tasks || []) {
      rows.push({
        type: "task",
        date: t.date,
        time: t.time || "",
        title: t.title || "",
        description: t.description || "",
        completed: t.completed ? "✔" : "❌"
      });
    }

    return rows;
  } catch (err) {
    console.error("❌ Ошибка fetchEntriesForWeek:", err);
    throw err;
  }
}

// ---------------------
// Экспорт: создаём два листа — Works и Tasks
// ---------------------
async function exportWeekToExcelFromDate(dateStr) {
  console.log("📤 exportWeekToExcelFromDate вызвана:", dateStr);

  // Проверка XLSX
  if (typeof window.XLSX === "undefined") {
    const msg = "XLSX не загружен. Подключите xlsx.full.min.js до export_to_exel.js";
    console.error("❌", msg);
    throw new Error(msg);
  }

  try {
    const rows = await fetchEntriesForWeek(dateStr);

    const works = rows.filter(r => r.type === "work");
    const tasks = rows.filter(r => r.type === "task");

    // Подготовим Excel книги
    const wb = XLSX.utils.book_new();

    // Если есть смены — добавляем лист Works
    if (works.length > 0) {
      // Приведём поля в удобный порядок/названия колонок
      const worksForSheet = works.map(w => ({
        Data: w.date,
        Praca_od: w.start,
        Praca_do: w.end,
        l_godzin: w.hours,
        Rodzaj_pracy: w.place,
        "Z kim": w.partner,
        Notatka: w.note
      }));
      const ws1 = XLSX.utils.json_to_sheet(worksForSheet);
      XLSX.utils.book_append_sheet(wb, ws1, "Works");
    } else {
      // Если нет записей, делаем пустой лист с заголовком
      const wsEmpty = XLSX.utils.json_to_sheet([{ Info: "No work entries for this week" }]);
      XLSX.utils.book_append_sheet(wb, wsEmpty, "Works");
    }

    // Tasks
    if (tasks.length > 0) {
      const tasksForSheet = tasks.map(t => ({
        Дата: t.date,
        Время: t.time,
        Задача: t.title,
        Описание: t.description,
        Статус: t.completed
      }));
      const ws2 = XLSX.utils.json_to_sheet(tasksForSheet);
      XLSX.utils.book_append_sheet(wb, ws2, "Tasks");
    } else {
      const wsEmpty = XLSX.utils.json_to_sheet([{ Info: "No tasks for this week" }]);
      XLSX.utils.book_append_sheet(wb, wsEmpty, "Tasks");
    }

    // Имя файла: week_YYYY-MM-DD.xlsx (дата = monday)
    const monday = getWeekRange(dateStr).from;
    const filename = `week_${monday}.xlsx`;

    XLSX.writeFile(wb, filename);
    console.log("✅ Экспорт завершён, файл:", filename);
  } catch (err) {
    console.error("❌ Ошибка exportWeekToExcelFromDate:", err);
    // не бросаем дальше — пусть вызывающий контролирует поведение
    throw err;
  }
}

// ---------------------
// Удобный глобальный доступ (app.js вызывает эту функцию)
// ---------------------
window.exportWeekToExcelFromDate = exportWeekToExcelFromDate;

// тоже делаем видимой вспомогательную ф-ю на всякий случай
window.fetchEntriesForWeek = fetchEntriesForWeek;

console.log("📦 export_to_exel.js инициализирован");
