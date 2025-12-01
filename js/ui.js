//js/ui.js
// ============================================================
// MODALS — универсальные функции
// ============================================================

// Открыть любое модальное окно
function openModal(id) {
    console.log("🟢 openModal:", id);
    document.getElementById(id).classList.remove("hidden");
}

// Закрыть модалку
function closeModal(id) {
    console.log("🔴 closeModal:", id);
    document.getElementById(id).classList.add("hidden");
}

window.openModal = openModal;
window.closeModal = closeModal;



// ============================================================
// 📌 МОДАЛКА РАБОТЫ (Добавить / Редактировать работу)
// ============================================================

function openWorkModal({ date = null, entry = null } = {}) {

    const title = document.getElementById("modalWorkTitle");

    if (entry) {
        // --- РЕДАКТИРОВАНИЕ ---
        title.textContent = "Редактировать смену";

        document.getElementById("workDate").value = entry.date;
        document.getElementById("workStart").value = entry.start_time;
        document.getElementById("workEnd").value = entry.end_time;
        document.getElementById("workPlace").value = entry.place || "";
        document.getElementById("workPartner").value = entry.partner || "";

        document.getElementById("workId").value = entry.id;
        document.getElementById("deleteWork").classList.remove("hidden");

    } else {
        // --- НОВАЯ СМЕНА ---
        title.textContent = "Добавить рабочее время";

        const today = selectedDate || new Date().toISOString().slice(0, 10);

        document.getElementById("workDate").value = date || today;
        document.getElementById("workStart").value = "";
        document.getElementById("workEnd").value = "";
        document.getElementById("workPlace").value = "";
        document.getElementById("workPartner").value = "";

        document.getElementById("workId").value = "";
        document.getElementById("deleteWork").classList.add("hidden");
    }

    openModal("modalWork");
}

window.openWorkModal = openWorkModal;



// ============================================================
// 📌 МОДАЛКА ЗАДАЧ (Добавить / Редактировать задачу)
// ============================================================

function openTaskModal({ date = null, task = null } = {}) {

    const title = document.getElementById("modalTaskTitle");

    if (task) {
        // --- РЕДАКТИРОВАНИЕ ---
        title.textContent = "Редактировать задачу";

        document.getElementById("taskDate").value = task.date;
        document.getElementById("taskTime").value = task.time || "";
        document.getElementById("taskTitle").value = task.title || "";
        document.getElementById("taskDescription").value = task.description || "";
        document.getElementById("taskId").value = task.id;

        document.getElementById("deleteTask").classList.remove("hidden");

    } else {
        // --- НОВАЯ ЗАДАЧА ---
        title.textContent = "Добавить задачу";

        const today = selectedDate || new Date().toISOString().slice(0, 10);

        document.getElementById("taskDate").value = date || today;
        document.getElementById("taskTime").value = "";
        document.getElementById("taskTitle").value = "";
        document.getElementById("taskDescription").value = "";
        document.getElementById("taskId").value = "";

        document.getElementById("deleteTask").classList.add("hidden");
    }

    openModal("modalTask");
}

window.openTaskModal = openTaskModal;



// ============================================================
// 📌 ОТКРЫТИЕ РЕДАКТИРОВАНИЯ ИЗ ДНЯ
// ============================================================

async function editWork(id) {
    console.log("✏ editWork:", id);

    const { data, error } = await supabaseClient
        .from("work_entries")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("❌ Ошибка загрузки смены:", error);
        return;
    }

    closeModal("modalDay");
    openWorkModal({ entry: data });
}

window.editWork = editWork;