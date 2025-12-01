//js/supabase.js

// URL твоего проекта в Supabase
const supabaseUrl = "https://fnocjjlsqijawypgxalm.supabase.co";
// Анонимный ключ
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZub2NqamxzcWlqYXd5cGd4YWxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzI3MDIsImV4cCI6MjA3OTgwODcwMn0._-aEFX0qAumIVdmkXhZhNUiDGQhSq0HRxTo73TJKyP0";
console.log("🔌 Инициализация Supabase...");
// Создание клиента
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
console.log("✅ Supabase client создан");
// Получение user_id
async function getUserId() {
    const {data} = await supabaseClient.auth.getUser();
    return data?.user?.id || null;
}

// ============================================================
// 📌 LOAD — загрузка данных
// ============================================================

// ---------- Смена за конкретную дату (1 день) ----------
// принимает дату, приводит к формату YYYY-MM-DD, делает один запрос, возвращает массив смен за день, корректно обрабатывает ошибки
async function loadWorkForDate(date) {
    const user_id = await getUserId();
    const clean = date.split("T")[0];

    const { data, error } = await supabaseClient
        .from("work_entries")
        .select("*")
        .eq("user_id", user_id)
        .eq("date", clean)
        .order("start_time");

    if (error) {
        console.error("❌ loadWorkForDate:", error);
        return [];
    }

    return data || [];
}
// ---------- ЗАДАЧИ (1 день) ----------
async function loadTasksForDate(date) {
    const user_id = await getUserId();
    const clean = date.split("T")[0];

    const { data, error } = await supabaseClient
        .from("tasks")
        .select("*")
        .eq("user_id", user_id)
        .eq("date", clean)
        .order("time");

    if (error) {
        console.error("❌ loadTasksForDate:", error);
        return [];
    }

    return data || [];
}
// ---------- СМЕНЫ за месяц - агружает все смены за указанный месяц, и превращает их в структуру вида, структуру потом использует calendar.js для отрисовки.----------
// ---------- СМЕНЫ за месяц ----------
// Загружает все смены за указанный месяц и превращает их в объект вида:
// { "2025-11-03": [смена1, смена2], "2025-11-04": [смена] }
async function loadWorkForMonth(year, month) {

    // Получение user_id (кто вошёл)
    const user_id = await getUserId();
    // Без user_id ты бы загрузила ВСЕ смены всех пользователей.

    // Формирование даты начала месяца и конца месяца
    // month+1 потому что JS считает: январь = 0
    const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;

    // Последний день месяца (28/29/30/31)
    const endDay = new Date(year, month + 1, 0).getDate();

    // Формирование конца месяца
    const end = `${year}-${String(month + 1).padStart(2, "0")}-${endDay}`;

    // Запрос к базе данных Supabase
    const { data, error } = await supabaseClient
        .from("work_entries")
        .select("*")
        .eq("user_id", user_id)       // Только смены текущего пользователя
        .gte("date", start)           // date >= начало месяца
        .lte("date", end)             // date <= конец месяца
        .order("date");               // сортировка по дате

    // Обработка ошибок
    if (error) {
        console.error("❌ loadWorkForMonth:", error);
        return {};
    }

    // Преобразование массива в объект по датам
    const map = {};

    data.forEach(w => {
        if (!map[w.date]) map[w.date] = [];
        map[w.date].push(w);
    });

    // Возврат объекта формата { "2025-11-03": [...] }
    return map;
}


// ============================================================
// 📝 SAVE — сохранение / редактирование
// ============================================================

// ---------- ЗАДАЧИ за месяц ----------
// загружает все задачи за указанный месяц и возвращает структуру используется: в calendar.js для рисования зелёной точки на дне, в open_day.js для показа задач в модальном окне, в отчётах
async function loadTasksForMonth(year, month) {
    const user_id = await getUserId();// Получение user_id

    // Формирование начала месяца и конца месяца
    const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDay = new Date(year, month + 1, 0).getDate();
    const end = `${year}-${String(month + 1).padStart(2, "0")}-${endDay}`;
    // Запрос к таблице tasks
    const { data, error } = await supabaseClient

        .from("tasks")// выбери всё из таблицы tasks
        .select("*")
        .eq("user_id", user_id)// где user_id = этому пользователю
        .gte("date", start)// date >= start
        .lte("date", end)// date <= end
        .order("date");// отсортируй по дате
    if (error) return {};
    // Преобразование массива в объект по датам, Из массива задач делаем объект «дата → список задач».
    const map = {};
    data.forEach(t => {
        if (!map[t.date]) map[t.date] = [];
        map[t.date].push(t);
    });
    // Возврат результата
    return map;
}

// ---------- СОХРАНИТЬ ЗАДАЧУ ----------
// отвечает за создание и редактирование задач.
async function saveTaskToDB(task) {
    console.log("🟥 [saveTaskToDB] ВХОД:", task);

    // Проверяем, есть ли дата у задачи
    if (!task.date) {
        console.error("❌ Ошибка: задача не имеет даты!");
        return; // Если даты нет — выходим из функции
    }
    console.log("🟥 [saveTaskToDB] CHECK ID:", task.id ? "UPDATE" : "INSERT");
    if (task.id) { // Если у задачи есть id → РЕДАКТИРУЕМ
        // UPDATE, РЕДАКТИРОВАНИЕ задачи (UPDATE)
        const { data, error } = await supabaseClient
            .from("tasks") // Таблица Supabase: tasks
            .update({
                date: task.date,
                time: task.time,
                title: task.title,
                description: task.description,
                completed: task.completed || false
                // Если completed = undefined, будет false.
            })
            .eq("id", task.id) // обновить именно эту задачу
            .select(); // Supabase вернёт изменённую запись.

        // Обработка ошибки
        if (error) {
            console.error("❌ Ошибка UPDATE задачи:", error);
        }
        console.log("🟥 [saveTaskToDB] UPDATE → результат:", data, "error:", error);
        return data;
    }

    // INSERT, СОЗДАНИЕ НОВОЙ ЗАДАЧИ (INSERT)
    delete task.id; // Если task.id нет: удаляем ID из объекта задачи, чтобы не было конфликтов при вставке новой записи

    // получаем user_id, задача принадлежит конкретному пользователю в Supabase.
    const { data: userData } = await supabaseClient.auth.getUser();
    task.user_id = userData?.user?.id || null;

    // Если дата не установлена — ставим текущую дату
    if (!task.date) {
        task.date = new Date().toISOString(); // Используем текущую дату, если не передана
    }

    const { data, error } = await supabaseClient
        .from("tasks")
        .insert([task])
        .select();
    // Обработка ошибок
    if (error) {
        console.error("❌ Ошибка INSERT задачи:", error);
    }
    console.log("🟥 [saveTaskToDB] INSERT → результат:", data, "error:", error);

    return data;
    // Функция возвращает: либо обновленную, либо созданную задачу
}


// ---------- СОХРАНИТЬ СМЕНУ ----------
// Работает по тому же принципу, что и сохранение задач:
async function saveWorkEntry(entry) {
    console.log("💾 saveWorkEntry:", entry);// Помогает видеть, что именно отправляется в Supabase 
    // проверка: нужно ли обновлять или создавать
    if (entry.id) {
        const { data, error } = await supabaseClient
            .from("work_entries")
            .update({
                date: entry.date, // дата
                start_time: entry.start_time,//  время начала 
                end_time: entry.end_time,//  время конца
                total_hours: entry.total_hours,// количество часов
                place: entry.place,// место работы
                partner: entry.partner // напарник
            })
            .eq("id", entry.id)
            .select();// возвращаем обновлённые данные
        // Если Supabase не смог обновить — покажет в консоли.
        if (error) console.error("❌ Ошибка UPDATE смены:", error);
        return data;
    }
    // Если id нет — создаём новую запись,Удаляем поле, чтобы Supabase сам создал id.
    delete entry.id;

    // добавляем user_id, смена должна быть привязана к конкретному пользователю, Так календарь становится персональным
    const { data: userData } = await supabaseClient.auth.getUser();
    entry.user_id = userData?.user?.id || null;
    // вставка новой записи
    const { data, error } = await supabaseClient
        .from("work_entries")
        .insert([entry])
        .select();

    if (error) console.error("❌ Ошибка INSERT смены:", error);
    // возврат результата, Т. е. массив со вставленной / обновлённой записью.
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