
//js/open_day.js
// ======================================================
// 📅 OPEN_DAY.JS — Модалка дня
// ======================================================

// ------------------------------------------------------
// 📌 Открыть модалку выбранного дня
// ------------------------------------------------------
async function openDayModal(year, month, day) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    console.log("📅 Открыт день:", date);

    selectedDate = date;

    // Загружаем данные
    const work = await loadWorkForDate(date);
    const tasks = await loadTasksForDate(date);

    console.log("📦 Данные дня:", { work, tasks });

    // ------------------------------------------
    // 🟦 Рендер смен
    // ------------------------------------------
    let workHtml = `
    <div class="day-section-title">Смена</div>
`;

    if (work.length === 0) {
        workHtml += `<div class="empty">Нет смен</div>`;
    } else {
        work.forEach(w => {
            workHtml += `
            <div class="day-work-card">
                <div class="work-time">🕒 ${w.start_time}–${w.end_time} <span>(${w.total_hours}ч)</span></div>
                <div class="work-place">📍 ${w.place}</div>
                <div class="work-partner">👤 ${w.partner || "-"}</div>

                <div class="modal-actions">
                    <button class="modal-btn edit" onclick="editWork('${w.id}')">✏ Изменить</button>
                    <button class="modal-btn delete" onclick="deleteWork('${w.id}')">🗑 Удалить</button>
                </div>
            </div>
        `;
        });
    }

    document.getElementById("dayWorkInfo").innerHTML =
        workHtml || `<div class="empty">Нет смен</div>`;

    // ------------------------------------------
    // 🟩 Рендер задач
    // ------------------------------------------
    let taskHtml = `
    <div class="day-section-title">Задачи</div>
`;

    if (tasks.length === 0) {
        taskHtml += `<div class="empty">Нет задач</div>`;
    } else {
        tasks.forEach(t => {
            taskHtml += `
            <div class="day-task-card">
                <div class="task-main">
                    <span class="task-time">⏱ ${t.time || "--:--"}</span>
                    <span class="task-title">${t.title}</span>
                </div>
                <div class="task-desc">${t.description || ""}</div>

                <div class="modal-actions">
                    <button class="modal-btn edit" onclick="toggleTaskCompleted('${t.id}', ${t.completed})">
                        ${t.completed ? "🔄 Отметить как невыполненную" : "✔ Выполнено"}
                    </button>
                    <button class="modal-btn edit" onclick="editTask('${t.id}')">✏ Изменить</button>
                    <button class="modal-btn delete" onclick="deleteTask('${t.id}')">🗑 Удалить</button>
                </div>
            </div>
        `;
        });
    }

    document.getElementById("dayTaskInfo").innerHTML =
        taskHtml || `<div class="empty">Нет задач</div>`;

    // ------------------------------------------
    // Открываем модалку дня
    // ------------------------------------------
    document.getElementById("dayTitle").textContent = date;
    openModal("modalDay");
}

// ======================================================
// ✏ Редактирование смены
// ======================================================
async function editWork(id) {
    console.log("✏ Редактирование смены:", id);

    closeModal("modalDay");

    const { data, error } = await supabaseClient
        .from("work_entries")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("❌ Ошибка загрузки смены:", error);
        return;
    }

    openWorkModal({ entry: data });
}

window.editWork = editWork;


// ======================================================
// ✏ Редактировать задачу
// ======================================================
async function editTask(id) {
    console.log("✏ Редактирование задачи:", id);

    closeModal("modalDay");

    const { data, error } = await supabaseClient
        .from("tasks")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("❌ Ошибка загрузки задачи:", error);
        return;
    }

    openTaskModal({ task: data });
}

window.editTask = editTask;


// ======================================================
// 🗑 Удалить смену
// ======================================================
async function deleteWork(id) {
    if (!confirm("Удалить смену?")) return;

    console.log("🗑 Удаление смены:", id);

    await deleteWorkEntry(id);

    closeModal("modalDay");
    renderCalendar();
}

window.deleteWork = deleteWork;


// ======================================================
// 🗑 Удалить задачу
// ======================================================
async function deleteTask(id) {
    if (!confirm("Удалить задачу?")) return;

    console.log("🗑 Удаление задачи:", id);

    const { error } = await supabaseClient
        .from("tasks")
        .delete()
        .eq("id", id);

    if (error) console.error("❌ Ошибка удаления задачи:", error);

    closeModal("modalDay");
    renderCalendar();
}

window.deleteTask = deleteTask;


// ======================================================
// ✔ Отметить задачу выполненной / невыполненной
// ======================================================
async function toggleTaskCompleted(id, currentStatus) {
    console.log("⚡ toggleTaskCompleted:", id, currentStatus);

    await supabaseClient
        .from("tasks")
        .update({ completed: !currentStatus })
        .eq("id", id);

    // Перезагрузка UI
    renderCalendar();

    const d = new Date(selectedDate);
    openDayModal(d.getFullYear(), d.getMonth(), d.getDate());
}

window.toggleTaskCompleted = toggleTaskCompleted;


