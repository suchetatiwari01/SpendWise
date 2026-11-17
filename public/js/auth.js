
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");

async function submitAuth(url, data, form) {
    const button = form.querySelector("button");

    button.disabled = true;
    message.textContent = "";
    message.classList.remove("success");

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Something went wrong"
            );
        }

        message.textContent = result.message;
        message.classList.add("success");

       window.location.replace("/index.html");

    } catch (error) {
        message.textContent = error.message;
    } finally {
        button.disabled = false;
    }
}

if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        submitAuth("/api/auth/login", {
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        }, loginForm);
    });
}

if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
        event.preventDefault();

        submitAuth("/api/auth/register", {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        }, registerForm);
    });
}
