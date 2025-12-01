// ===========================================
// auth.js — Этот файл отвечает за: вход/выход,проверку авторизации, восстановление пароля, показ модальных окон
// ===========================================
console.log("AUTH FILE LOADED!");
// ---- Универсальный redirect определяет куда Supabase должен вернуть пользователя после входа или восстановления пароля.----
function getRedirectURL() {
    // Вариант 1 — GitHub Pages
    const origin = window.location.origin;

    if (origin.includes("github.io")) {
        return origin + "/work_calendar/";// Возвращаем: https://имя.github.io/work_calendar/
    }
    // Вариант 2 — локальный сервер
    return "http://127.0.0.1:5500/";
}


// -------------------------------------------
// 🔄 Восстановление пароля (PKCE) — правильный обработчик
// -------------------------------------------
async function handleRecoveryFromURL() {
    const url = window.location.href; //является ли URL ссылкой для восстановления

    // ищем type=recovery, 
    if (!url.includes("type=recovery")) return false;

    console.log("🔁 Recovery URL detected:", url);

    // Передаём ВЕСЬ URL, а НЕ hash
    const { data, error } = await supabaseClient.auth.
        // Если да — вызываем: модалку смены пароля
        exchangeCodeForSession(url);

    if (error) {
        console.error("❌ exchangeCodeForSession error:", error);
        alert("Ошибка восстановления: " + error.message);
        return false;
        //Если нет type=recovery → функция просто возвращает false.
    }

    console.log("🔐 Recovery session OK:", data);
    // Показываем окно смены пароля, В этот момент пользователь уже авторизован временно, и может менять пароль.
    showNewPasswordModal();
    return true;
}


window.handleRecoveryFromURL = handleRecoveryFromURL;
// функцию registerUser() регистрирует нового пользователя
async function registerUser() {
    const email = document.getElementById("regEmail").value.trim();
    const pass1 = document.getElementById("regPass").value;
    const pass2 = document.getElementById("regPass2").value;

    if (!email || !pass1) {
        alert("Введите email и пароль");
        return;
    }

    if (pass1 !== pass2) {
        alert("Пароли не совпадают");
        return;
    }

    try {
        console.log("📨 Отправляем запрос на регистрацию...");

        const { data, error } = await supabase.auth.signUp({
            email,
            password: pass1
        });

        if (error) {
            console.error("❌ Ошибка регистрации:", error);
            alert(error.message);
            return;
        }

        console.log("🎉 Пользователь зарегистрирован:", data);

        alert("Аккаунт создан! Теперь войдите.");

        closeModal("registerModal");
        openModal("loginModal");

    } catch (err) {
        console.error("🔥 Ошибка registerUser():", err);
        alert("Ошибка регистрации");
    }
}
await supabase.auth.signInWithPassword({ email, password: pass1 });



// -------------------------------------------
// 🪪 Проверка авторизации, Проверка: пользователь вошёл или нет.
// -------------------------------------------
async function checkAuth() {
    console.log("🔍 Проверка сессии...");
    const { data, error } = await supabaseClient.auth.getSession();// Получаем активную сессию, Если пользователь не вошёл → сессии нет.

    console.log("📦 Ответ getSession():", data);
    if (error) console.error("❌ Ошибка getSession():", error);
    // Если сессии нет, показываем окно логина:
    if (!data.session) {
        console.log("🚫 Сессия отсутствует — показываем loginModal");
        document.getElementById("loginModal").classList.remove("hidden");
        return false;
        // Календарь не загружается, пока пользователь не войдёт.
    }
    // Если пользователь авторизован, сохраняем данные в глобальную переменную
    console.log("🟢 Сессия найдена. Пользователь:", data.session.user);
    window.currentUser = data.session.user;
    document.getElementById("loginModal").classList.add("hidden");

    return true;
}
window.checkAuth = checkAuth;


// -------------------------------------------
// 🔐 Модалка смены пароля, Эта функция перерисовывает содержимое модального окна.
// -------------------------------------------
function showNewPasswordModal() {
    const modal = document.getElementById("loginModal");

    modal.innerHTML = `
        <div class="modal-window" style="max-width:350px;">
            <h2>🔐 Новый пароль</h2>
            <input id="newPass" type="password" placeholder="Введите новый пароль" class="form-input">
            <button id="resetPassBtn" class="modal-btn edit">Сменить пароль</button>
        </div>
    `;

    modal.classList.remove("hidden");

    document.getElementById("resetPassBtn").onclick = async () => {
        const newPass = document.getElementById("newPass").value.trim();

        if (!newPass) return alert("Введите пароль");

        const { error } = await supabaseClient.auth.updateUser({ password: newPass });

        if (error) return alert("Ошибка: " + error.message);

        alert("Пароль обновлён!");
        window.location.href = getRedirectURL();
    };
}


// -------------------------------------------
// 🚪 Логин / Логаут
// -------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const loginEmail = document.getElementById("loginEmail");
    const loginPass = document.getElementById("loginPass");

    document.getElementById("loginBtn").onclick = async () => {
    const email = loginEmail.value.trim();
    const pass  = loginPass.value.trim();

    console.log("🔐 Попытка входа:", email);

    const result = await supabaseClient.auth.signInWithPassword({
        email,
        password: pass
    });

    console.log("📩 Ответ Supabase:", result);

    if (result.error) {
        alert("Ошибка входа: " + result.error.message);
        return;
    }

    console.log("✅ Вход успешен, перезагружаем страницу для загрузки сессии");
    setTimeout(() => location.reload(), 300);
};




    document.getElementById("logoutBtn").onclick = async () => {
        await supabaseClient.auth.signOut();
        location.reload();
    };
});
