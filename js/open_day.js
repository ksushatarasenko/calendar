
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
// ======================================================
// ✏ Редактировать смену
// ======================================================
// ✏ Редактирование смены
async function editWork(id) {
    console.log("✏ Редактирование смены:", id);

    closeModal("modalDay");

    // ПРАВИЛЬНОЕ НАЗВАНИЕ ТАБЛИЦЫ
    const { data, error } = await supabaseClient
        .from("work_entries")   // ← ВОТ ЭТО ТВОЯ ТАБЛИЦА
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("❌ Ошибка загрузки смены:", error);
        return;
    }

    console.log("🟩 [editWork] данные смены:", data);

    document.getElementById("modalWorkTitle").textContent = "Редактировать смену";

    document.getElementById("workId").value = data.id;
    document.getElementById("workDate").value = data.date;
    document.getElementById("workStart").value = data.start_time;
    document.getElementById("workEnd").value = data.end_time;
    document.getElementById("workPlace").value = data.place;
    document.getElementById("workPartner").value = data.partner;

    document.getElementById("deleteWork").classList.remove("hidden");

    openModal("modalWork");
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
// ---- Усовершённый deleteTask с подробными логами ----
async function deleteTask(id) {
    console.log("🗑 [deleteTask] START. id =", id);

    if (!confirm("Удалить задачу?")) {
        console.log("🗑 [deleteTask] Отменено пользователем");
        return;
    }

    try {
        // Пытаемся удалить и сразу вернуть удалённые строки (select())
        console.log("🗑 [deleteTask] Выполняю delete().select()");
        const { data, error } = await supabaseClient
            .from("tasks")
            .delete()
            .eq("id", id)
            .select(); // запрос вернёт удалённую запись(и) если удаление прошло

        console.log("🗑 [deleteTask] Ответ delete():", { data, error });

        if (error) {
            console.error("🗑 [deleteTask] Supabase error при удалении:", error);
            alert("Ошибка при удалении (см. консоль).");
            return;
        }

        if (Array.isArray(data) && data.length > 0) {
            console.log("🗑 [deleteTask] Удаление подтверждено — удалено записей:", data.length);
        } else {
            console.warn("🗑 [deleteTask] delete() вернул пустой data → возможно RLS или ничего не удалено");
        }

        // Дополнительная проверка: пробуем получить запись по id (должно вернуть пустой массив)
        console.log("🗑 [deleteTask] Проверяю наличие записи после удаления (select)");
        const { data: check, error: checkErr } = await supabaseClient
            .from("tasks")
            .select("*")
            .eq("id", id);

        console.log("🗑 [deleteTask] Проверка после удаления:", { checkErr, check });

        if (checkErr) {
            console.error("🗑 [deleteTask] Ошибка при проверке наличия записи:", checkErr);
        } else if (Array.isArray(check) && check.length === 0) {
            console.log("🗑 [deleteTask] Подтверждение: запись отсутствует в таблице");
        } else {
            console.warn("🗑 [deleteTask] Запись всё ещё присутствует! Возможные причины: RLS (policy), mismatch user_id, или другой селектор.");
            // Выведем user_id у текущей сессии и у записи (если она есть) — это поможет понять RLS
            try {
                const { data: sessionData } = await supabaseClient.auth.getUser();
                console.log("🗑 [deleteTask] Текущий user_id:", sessionData?.user?.id);
            } catch (e) {
                console.warn("🗑 [deleteTask] Невозможно получить текущую сессию:", e);
            }

            if (Array.isArray(check) && check.length > 0) {
                console.log("🗑 [deleteTask] Содержимое найденной записи:", check[0]);
            }
        }

        // Перерисовываем UI вне зависимости от результата (чтобы пользователь увидел актуальные данные)
        closeModal("modalDay");
        renderCalendar();
    } catch (err) {
        console.error("🗑 [deleteTask] Неожиданная ошибка:", err);
        alert("Неожиданная ошибка при удалении (см. консоль).");
    }
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


