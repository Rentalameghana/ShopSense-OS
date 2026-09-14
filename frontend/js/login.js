const REMEMBERED_USER_KEY = "shopsenseRememberedUser";

function getElement(id) {
    return document.getElementById(id);
}

function setMessage(id, message) {
    const element = getElement(id);
    if (element) {
        element.textContent = message;
    }
}

function login() {
    const email = getElement("email").value.trim();
    const password = getElement("password").value;
    const rememberMe = getElement("rememberMe").checked;

    setMessage("loginMessage", "");

    if (!email || !password) {
        setMessage("loginMessage", "Please enter your email or username and password.");
        return;
    }

    if (rememberMe) {
        localStorage.setItem(REMEMBERED_USER_KEY, email);
    } else {
        localStorage.removeItem(REMEMBERED_USER_KEY);
    }

    alert("Login Successful!");
    window.location.href = "dashboard.html";
}

function showRegister() {
    getElement("loginCard").hidden = true;
    getElement("registerCard").hidden = false;
    getElement("businessName").focus();
}

function showLogin() {
    getElement("registerCard").hidden = true;
    getElement("loginCard").hidden = false;
    getElement("email").focus();
}

function registerVendor() {
    const business = getElement("businessName").value.trim();
    const owner = getElement("ownerName").value.trim();
    const email = getElement("registerEmail").value.trim();
    const password = getElement("registerPassword").value;
    const confirm = getElement("confirmPassword").value;

    setMessage("registerMessage", "");

    if (!business || !owner || !email || !password || !confirm) {
        setMessage("registerMessage", "Please fill in all registration fields.");
        return;
    }

    if (password !== confirm) {
        setMessage("registerMessage", "Passwords do not match.");
        return;
    }

    alert("Vendor Registered Successfully!");
    getElement("loginForm").reset();
    getElement("registerForm").reset();
    showLogin();
}

function togglePassword(button) {
    const input = getElement(button.dataset.togglePassword);
    const isPassword = input.type === "password";

    input.type = isPassword ? "text" : "password";
    button.textContent = isPassword ? "Hide" : "Show";
    button.setAttribute("aria-label", `${isPassword ? "Hide" : "Show"} password`);
}

document.addEventListener("DOMContentLoaded", () => {
    const rememberedUser = localStorage.getItem(REMEMBERED_USER_KEY);

    if (rememberedUser) {
        getElement("email").value = rememberedUser;
        getElement("rememberMe").checked = true;
    }

    getElement("loginForm").addEventListener("submit", event => {
        event.preventDefault();
        login();
    });

    getElement("registerForm").addEventListener("submit", event => {
        event.preventDefault();
        registerVendor();
    });

    document.querySelectorAll("[data-toggle-password]").forEach(button => {
        button.addEventListener("click", () => togglePassword(button));
    });

    document.querySelectorAll(".role-btn").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".role-btn").forEach(roleButton => {
                roleButton.classList.remove("active");
                roleButton.setAttribute("aria-pressed", "false");
            });
            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");
        });
    });

    getElement("showRegister").addEventListener("click", event => {
        event.preventDefault();
        showRegister();
    });

    getElement("showLogin").addEventListener("click", event => {
        event.preventDefault();
        showLogin();
    });

    getElement("forgotPassword").addEventListener("click", event => {
        event.preventDefault();
        setMessage("loginMessage", "Please contact your ShopSense administrator to reset your password.");
    });
});