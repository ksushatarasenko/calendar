// обработчик для кнопки saveWork
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("saveWork").onclick = async () => {
        // Проверки на существование каждого элемента
        const workDate = document.getElementById("workDate");
        if (!workDate) {
            console.error("Элемент с id 'workDate' не найден");
            return;
        }

        const workStart = document.getElementById("workStart");
        if (!workStart) {
            console.error("Элемент с id 'workStart' не найден");
            return;
        }

        const workEnd = document.getElementById("workEnd");
        if (!workEnd) {
            console.error("Элемент с id 'workEnd' не найден");
            return;
        }

        const workPlace = document.getElementById("workPlace");
        if (!workPlace) {
            console.error("Элемент с id 'workPlace' не найден");
            return;
        }

        const workPartner = document.getElementById("workPartner");
        if (!workPartner) {
            console.error("Элемент с id 'workPartner' не найден");
            return;
        }

        // Собираем данные из формы
        const workEntry = {
            date: workDate.value,
            start_time: workStart.value,
            end_time: workEnd.value,
            place: workPlace.value,
            partner: workPartner.value
        };

        console.log("📌 Данные смены:", workEntry);

        // Вызываем функцию для сохранения смены в базе данных
        await saveWorkEntry(workEntry);

        console.log("🔄 Перерисовываем календарь после сохранения смены");

        // Закрытие модалки и обновление календаря
        closeModal("modalWork");
        renderCalendar();
    };
});

