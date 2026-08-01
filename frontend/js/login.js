console.log("login.js loaded");

function login() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (email === "" || password === "") {
        alert("Please enter email and password");
        return;
    }

    // Simple login validation for Milestone 1 demo
    alert("Login Successful");

    window.location.href = "dashboard.html";
}