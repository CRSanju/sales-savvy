function ensureAdmin() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  if (!token || role !== "ADMIN") {
    window.location.href = "/admin-login.html";
    return false;
  }

  const welcome = document.getElementById("welcomeText");
  if (welcome) welcome.innerText = `Welcome, ${username}`;
  return true;
}

async function loadAdminData() {
  const token = localStorage.getItem("token");
  const resultEl = document.getElementById("apiResult");

  resultEl.style.display = "block";
  resultEl.innerText = "Pinging API…";

  const response = await fetch("/admin/home", {
    headers: { "Authorization": "Bearer " + token }
  });

  const text = await response.text();
  resultEl.innerText = text;
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  window.location.href = "/index.html";
}

document.addEventListener("DOMContentLoaded", ensureAdmin);
