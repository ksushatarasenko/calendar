// =========================
//  AUTH.JS — авторизация
// =========================

console.log("🔐 auth.js loaded");


// ===========================================
//  ВОССТАНОВЛЕНИЕ СЕССИИ ПО magic link
// ===========================================
async function handleRecoveryFromURL() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const type = params.get("type");
    const access_token = params.get("access_token");

    if (type === "recovery" && access_token) {
        console.log("🔐 Magic link recovery");

        await supabaseClient.auth.setSession({
            access_token,
            refresh_token: params.get("refresh_token")
        });

        return true;
    }
    return false;
}



// ===========================
//   Проверка авторизации
// ===========================
async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();

    console.log("🔍 Ответ getSession():", { session });

    if (!session) {
        console.warn("⚠ Нет сессии — открываю login modal");
        document.getElementById("loginModal").classList.remove("hidden");
        return false;
    }

    window.currentUser = session.user;

    console.log("🟢 СЕССИЯ ОК, USER:", session.user);
    return true;
}



// ===========================
//   РЕГИСТРАЦИЯ (Единственная правильная версия)
// ===========================
async function registerUser(email, password) {
    console.log("► registerUser:", email);

    // вызов signUp
    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password
    });

    if (error) {
        console.error("❌ signUp error:", error);
        return { error };
    }

    console.log("✔ supabase.auth.signUp:", data);

    // пробуем создать профиль в таблице
    if (data.user) {
        const profile = {
            id: data.user.id,
            email: data.user.email,
            full_name: null,
            avatar_url: null
        };

        const { error: pErr } = await supabaseClient
            .from("profiles")
            .insert([profile]);

        if (pErr) {
            console.warn("⚠ Профиль НЕ создан:", pErr);
            return { user: data.user, warning: pErr };
        }
    }

    return { user: data.user };
}



// ===========================
//         LOGIN
// ===========================
async function loginUser(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert("Ошибка входа: " + error.message);
        return false;
    }

    console.log("🔑 ЛОГИН успешен:", data.user);
    document.getElementById("loginModal").classList.add("hidden");
    return true;
}



// ===========================
//         LOGOUT
// ===========================
async function logoutUser() {
    await supabaseClient.auth.signOut();
    location.reload();
}



// ===============================
//  Назначение обработчиков кнопок
// ===============================
console.log("🔍 DEBUG START — проверяем DOM");

// Проверяем модалку
console.log("registerModal:", document.getElementById("registerModal"));

// Проверяем кнопку REGISTER
console.log("registerBtn:", document.getElementById("registerBtn"));

// Проверяем input-поля регистрации
console.log("regEmail:", document.getElementById("regEmail"));
console.log("regPass:", document.getElementById("regPass"));
console.log("regPass2:", document.getElementById("regPass2"));

// Проверяем login кнопки
console.log("loginBtn:", document.getElementById("loginBtn"));
console.log("logoutBtn:", document.getElementById("logoutBtn"));

// Проверяем порядок загрузки всех JS файлов
console.log("🧩 JS LOADED ORDER CHECK - if something is undefined → ошибка в загрузке");

// ===============================
//  Назначение обработчиков кнопок
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    console.log("🔧 Назначаем обработчики кнопок LOGIN / LOGOUT / REGISTER");

    // 🔹 LOGIN
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.onclick = async () => {
            console.log("▶ ЛОГИН");

            const email = loginEmail.value.trim();
            const pass  = loginPassword.value.trim();

            await loginUser(email, pass);
        };
    }

    // 🔹 LOGOUT
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            console.log("▶ ВЫЙТИ");
            await logoutUser();
        };
    }

    // 🔹 OPEN REGISTER MODAL
    const openRegisterBtn = document.getElementById("openRegisterBtn");
    if (openRegisterBtn) {
        openRegisterBtn.onclick = () => {
            console.log("▶ Открываю окно регистрации");
            openModal("registerModal");
        };
    }

    // 🔹 BACK TO LOGIN
    const backToLoginBtn = document.getElementById("backToLoginBtn");
    if (backToLoginBtn) {
        backToLoginBtn.onclick = () => {
            console.log("▶ Назад к логину");
            closeModal("registerModal");
            openModal("loginModal");
        };
    }

    // 🔹 REGISTER
    const regBtn = document.getElementById("registerBtn");
    if (regBtn) {
        regBtn.onclick = async () => {
            console.log("▶ РЕГИСТРАЦИЯ");

            const email = regEmail.value.trim();
            const pass  = regPass.value.trim();
            const pass2 = regPass2.value.trim();

            if (!email) return alert("Введите email");
            if (!pass) return alert("Введите пароль");
            if (pass !== pass2) return alert("Пароли не совпадают");

            const res = await registerUser(email, pass);
            console.log("registerUser:", res);

            if (res.error) {
                alert("Ошибка: " + res.error.message);
            } else {
                alert("✔ Пользователь создан!");
                closeModal("registerModal");
            }
        };
    }
});


