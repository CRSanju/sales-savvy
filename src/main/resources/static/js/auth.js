async function registerUser(event) {
  event.preventDefault();

  const data = {
    name: document.getElementById("name").value,
    username: document.getElementById("username").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  };

  const response = await fetch("/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await response.json().catch(() => ({}));

  const msg = document.getElementById("message");
  if (!response.ok) {
    msg.innerText =
      result.message || "Registration failed. Please check your details.";
    msg.className = "msg msg--err";
    return;
  }

  msg.innerText = result.message || "Registration completed";
  msg.className = "msg msg--ok";

  setTimeout(() => {
    window.location.href = "/login.html";
  }, 1000);
}

async function loginUser(event, isAdminLogin = false) {
  event.preventDefault();

  const data = {
    username: document.getElementById("username").value,
    password: document.getElementById("password").value
  };

  const response = await fetch("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await response.json().catch(() => ({}));

  const msg = document.getElementById("message");
  if (!response.ok) {
    msg.innerText = "Invalid credentials";
    msg.className = "msg msg--err";
    return;
  }

  localStorage.setItem("token", result.token);
  localStorage.setItem("username", result.username);
  localStorage.setItem("role", result.role);

  if (result.role === "ADMIN") {
    window.location.href = "/admin-home.html";
  } else {
    window.location.href = "/customer-home.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const adminLoginForm = document.getElementById("adminLoginForm");

  if (signupForm) {
    signupForm.addEventListener("submit", registerUser);
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => loginUser(e, false));
  }

  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", (e) => loginUser(e, true));
  }
});