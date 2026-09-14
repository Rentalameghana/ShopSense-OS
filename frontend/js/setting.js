const SETTINGS_KEY = "shopsenseSettings";

function setSettingsMessage(message, type = "") {
    const element = document.getElementById("settingsMessage");
    if (!element) return;
    element.textContent = message;
    element.className = `settings-message ${type}`.trim();
}

function getSavedSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    } catch {
        return {};
    }
}

function saveSettings() {
    const nameInput = document.getElementById("profileName");
    const emailInput = document.getElementById("profileEmail");
    const settings = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        emailNotifications: document.getElementById("emailNotifications").checked,
        systemAlerts: document.getElementById("systemAlerts").checked
    };

    if (!settings.name || !settings.email || !emailInput.checkValidity()) {
        setSettingsMessage("Please enter a valid name and email address.", "error");
        return;
    }

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSettingsMessage("Settings saved on this device.", "success");
}

function validatePasswordChange() {
    const currentPassword = document.getElementById("currentPassword");
    const newPassword = document.getElementById("newPassword");

    if (!currentPassword.value || !newPassword.value) {
        setSettingsMessage("Enter both current and new passwords.", "error");
        return;
    }

    if (newPassword.value.length < 8) {
        setSettingsMessage("The new password must contain at least 8 characters.", "error");
        return;
    }

    setSettingsMessage("Password validation passed. Password updates require a backend endpoint.", "success");
    currentPassword.value = "";
    newPassword.value = "";
}

document.addEventListener("DOMContentLoaded", () => {
    const savedSettings = getSavedSettings();

    if (savedSettings.name) document.getElementById("profileName").value = savedSettings.name;
    if (savedSettings.email) document.getElementById("profileEmail").value = savedSettings.email;
    if (typeof savedSettings.emailNotifications === "boolean") {
        document.getElementById("emailNotifications").checked = savedSettings.emailNotifications;
    }
    if (typeof savedSettings.systemAlerts === "boolean") {
        document.getElementById("systemAlerts").checked = savedSettings.systemAlerts;
    }

    document.getElementById("saveProfile").addEventListener("click", saveSettings);
    document.getElementById("updatePassword").addEventListener("click", validatePasswordChange);
    document.getElementById("emailNotifications").addEventListener("change", saveSettings);
    document.getElementById("systemAlerts").addEventListener("change", saveSettings);
});