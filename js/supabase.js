//js/supabase.js

const supabaseUrl = "https://fnocjjlsqijawypgxalm.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZub2NqamxzcWlqYXd5cGd4YWxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzI3MDIsImV4cCI6MjA3OTgwODcwMn0._-aEFX0qAumIVdmkXhZhNUiDGQhSq0HRxTo73TJKyP0";

console.log("🔌 Инициализация Supabase...");
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
console.log("✅ Supabase client создан");



// ============================================================
// 📌 LOAD — загрузка данных
// ============================================================

// ---------- СМЕНА (1 день) ----------
async function loadWorkForDate(date) {
    const clean = date.split("T")[0];
    const { data, error } = await supabaseClient
        .from("work_entries")
        .select("*")
        .eq("date", clean)
        .order("start_time");

    if (error) console.error("❌ loadWorkForDate:", error);
    return data || [];
}

// ---------- ЗАДАЧИ (1 день) ----------
async function loadTasksForDate(date) {
    const clean = date.split("T")[0];

    const { data, error } = await supabaseClient
        .from("tasks")
        .select("*")
        .eq("date", clean)
        .order("time");

    if (error) console.error("❌ loadTasksForDate:", error);
    return data || [];
}

// ---------- СМЕНЫ за месяц ----------
async function loadWorkForMonth(year, month) {
    const start = `${year}-${String(month+1).padStart(2, "0")}-01`;
    const endDay = new Date(year, month+1, 0).getDate();
    const end = `${year}-${String(month+1).padStart(2, "0")}-${endDay}`;

    console.log(`📆 Загружаю смены: ${start} → ${end}`);

    const { data, error } = await supabaseClient
        .from("work_entries")
        .select("*")
        .gte("date", start)
        .lte("date", end)
        .order("date");

    if (error) {
        console.error("❌ loadWorkForMonth:", error);
        return {};
    }

    const map = {};
    data.forEach(w => {
        if (!map[w.date]) map[w.date] = [];
        map[w.date].push(w);
    });

    return map;
}

// ---------- ЗАДАЧИ за месяц ----------
async function loadTasksForMonth(year, month) {
    const start = `${year}-${String(month+1).padStart(2, "0")}-01`;
    const endDay = new Date(year, month+1, 0).getDate();
    const end = `${year}-${String(month+1).padStart(2, "0")}-${endDay}`;

    console.log(`📆 Загружаю задачи: ${start} → ${end}`);

    const { data, error } = await supabaseClient
        .from("tasks")
        .select("*")
        .gte("date", start)
        .lte("date", end)
        .order("date");

    if (error) {
        console.error("❌ loadTasksForMonth:", error);
        return {};
    }

    const map = {};
    data.forEach(t => {
        if (!map[t.date]) map[t.date] = [];
        map[t.date].push(t);
    });

    return map;
}



// ============================================================
// 📝 SAVE — сохранение / редактирование
// ============================================================

// ---------- СОХРАНИТЬ ЗАДАЧУ ----------
async function saveTaskToDB(task) {
    console.log("💾 saveTaskToDB:", task);

    if (task.id) {
        // UPDATE
        const { data, error } = await supabaseClient
            .from("tasks")
            .update({
                date: task.date,
                time: task.time,
                title: task.title,
                description: task.description,
                completed: task.completed || false
            })
            .eq("id", task.id)
            .select();

        if (error) console.error("❌ Ошибка UPDATE задачи:", error);
        return data;
    }

    // INSERT
    delete task.id;
    const { data, error } = await supabaseClient
        .from("tasks")
        .insert([task])
        .select();

    if (error) console.error("❌ Ошибка INSERT задачи:", error);
    return data;
}

// ---------- СОХРАНИТЬ СМЕНУ ----------
async function saveWorkEntry(entry) {
    console.log("💾 saveWorkEntry:", entry);

    if (entry.id) {
        const { data, error } = await supabaseClient
            .from("work_entries")
            .update({
                date: entry.date,
                start_time: entry.start_time,
                end_time: entry.end_time,
                total_hours: entry.total_hours,
                place: entry.place,
                partner: entry.partner
            })
            .eq("id", entry.id)
            .select();

        if (error) console.error("❌ Ошибка UPDATE смены:", error);
        return data;
    }

    delete entry.id;
    const { data, error } = await supabaseClient
        .from("work_entries")
        .insert([entry])
        .select();

    if (error) console.error("❌ Ошибка INSERT смены:", error);
    return data;
}



// ============================================================
// ❌ DELETE — удаление
// ============================================================

// ---------- УДАЛИТЬ ЗАДАЧУ ----------
async function deleteTask(id) {
    const { error } = await supabaseClient
        .from("tasks")
        .delete()
        .eq("id", id);

    if (error) console.error("❌ Ошибка deleteTask:", error);
}

// ---------- УДАЛИТЬ СМЕНУ ----------
async function deleteWorkEntry(id) {
    const { error } = await supabaseClient
        .from("work_entries")
        .delete()
        .eq("id", id);

    if (error) console.error("❌ Ошибка deleteWorkEntry:", error);
}



// ============================================================
// ✔ DONE — экспорт функций наружу
// ============================================================

window.loadWorkForDate = loadWorkForDate;
window.loadTasksForDate = loadTasksForDate;
window.loadWorkForMonth = loadWorkForMonth;
window.loadTasksForMonth = loadTasksForMonth;

window.saveTaskToDB = saveTaskToDB;
window.saveWorkEntry = saveWorkEntry;

window.deleteTask = deleteTask;
window.deleteWorkEntry = deleteWorkEntry;

console.log("✅ supabase.js полностью загружен");
