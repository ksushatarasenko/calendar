
// js/save_task.js — исправленный обработчик сохранения задачи
document.getElementById("saveTask").onclick = async () => {
    console.log("🟫 [saveTask] CLICKED");

    const idValue = document.getElementById("taskId").value;
    const dateValue = document.getElementById("taskDate").value;

    const task = {
        ...(idValue ? { id: idValue } : {}),
        date: dateValue,
        time: document.getElementById("taskTime").value,
        title: document.getElementById("taskTitle").value,
        description: document.getElementById("taskDescription").value,
    };

    console.log("🟪 [saveTask] Собран объект для сохранения:", task);

    const before = performance.now();
    const result = await saveTaskToDB(task);
    console.log("🟪 [saveTask] Ответ от saveTaskToDB:", result, 
                "⏱", (performance.now() - before).toFixed(1), "ms");

    closeModal("modalTask");
    console.log("🟫 [saveTask] Модалка закрыта → перерисовываем календарь");
    renderCalendar();
};

