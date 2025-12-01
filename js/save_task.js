
//js/save_task.js
document.getElementById("saveTask").onclick = async () => {
    console.log("🟦 Нажата кнопка: Сохранить задачу");

    const task = {
        date: selectedDate,
        title: document.getElementById("taskTitle").value,
        description: document.getElementById("taskDescription").value,
        time: document.getElementById("taskTime").value
    };

    console.log("📌 Данные задачи:", task);

    await saveTaskToDB(task);

    console.log("🔄 Перерисовка календаря после сохранения задачи");
    closeModal("modalTask");
    renderCalendar();
};