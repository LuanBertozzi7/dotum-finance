// TODO: substituir pela chamada real à API quando o backend estiver pronto
// POST /api/auth/login → { token }

const form = document.getElementById("login-form");
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const errorMsg = document.getElementById("error-msg");
const submitBtn = document.getElementById("submit-btn");
const toggleBtn = document.getElementById("toggle-password");
const eyeIcon = document.getElementById("eye-icon");
const eyeOffIcon = document.getElementById("eye-off-icon");

// Se já está logado, redireciona direto
if (localStorage.getItem("auth_token")) {
  window.location.replace("/index.html");
}

// Mostrar/ocultar senha
toggleBtn.addEventListener("click", () => {
  const isPassword = passwordEl.type === "password";
  passwordEl.type = isPassword ? "text" : "password";
  eyeIcon.classList.toggle("hidden", isPassword);
  eyeOffIcon.classList.toggle("hidden", !isPassword);
});

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove("hidden");
}

function hideError() {
  errorMsg.classList.add("hidden");
}

function setLoading(loading) {
  submitBtn.textContent = loading ? "Entrando..." : "Entrar";
  submitBtn.disabled = loading;
  submitBtn.style.opacity = loading ? "0.6" : "";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();

  const email = emailEl.value.trim();
  const password = passwordEl.value;

  if (!email || !password) {
    showError("Preencha e-mail e senha.");
    if (!email) emailEl.classList.add("error");
    if (!password) passwordEl.classList.add("error");
    return;
  }

  [emailEl, passwordEl].forEach((el) => el.classList.remove("error"));
  setLoading(true);

  try {
    // --- Substituir este bloco pela chamada real à API ---
    await new Promise((r) => setTimeout(r, 600)); // simula latência
    const fakeToken = btoa(`${email}:${Date.now()}`);
    localStorage.setItem("auth_token", fakeToken);
    window.location.replace("/index.html");
    // ----------------------------------------------------
  } catch {
    showError("Erro ao conectar. Tente novamente.");
    setLoading(false);
  }
});

[emailEl, passwordEl].forEach((el) => {
  el.addEventListener("input", () => el.classList.remove("error"));
});
