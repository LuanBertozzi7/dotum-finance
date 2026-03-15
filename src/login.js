const form = document.getElementById("login-form");
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const errorMsg = document.getElementById("error-msg");
const submitBtn = document.getElementById("submit-btn");
const toggleBtn = document.getElementById("toggle-password");
const eyeIcon = document.getElementById("eye-icon");
const eyeOffIcon = document.getElementById("eye-off-icon");

// Redirect authenticated users away from the login page immediately.
if (localStorage.getItem("auth_token")) {
  window.location.replace("/index.html");
}

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
    // TODO: replace with a real API call once the backend is ready.
    //   const res = await fetch("/api/auth/login", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ email, password }),
    //   });
    //   if (!res.ok) throw new Error("Invalid credentials");
    //   const { token } = await res.json();
    //   localStorage.setItem("auth_token", token);
    await new Promise((r) => setTimeout(r, 600));
    const fakeToken = btoa(`${email}:${Date.now()}`);
    localStorage.setItem("auth_token", fakeToken);
    window.location.replace("/index.html");
  } catch {
    showError("Erro ao conectar. Tente novamente.");
    setLoading(false);
  }
});

// Remove error highlight as soon as the user starts correcting a field.
[emailEl, passwordEl].forEach((el) => {
  el.addEventListener("input", () => el.classList.remove("error"));
});
