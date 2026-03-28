/**
 * ========================================
 * Dotum Finance - Login Page
 * ========================================
 *
 * Handles user authentication (email + password)
 * Communicates with backend API (/api/auth/login)
 * Stores JWT token in localStorage on successful login
 *
 * FLOW:
 * 1. User enters email and password
 * 2. Form submission → POST /api/auth/login
 * 3. API validates credentials and returns JWT token
 * 4. Token stored in localStorage
 * 5. Redirect to dashboard (/index.html)
 */

// ========================================
// DOM Element References
// ========================================
// ========================================
// Import API configuration
// ========================================
import { API_BASE_URL } from "./config.js";

const form = document.getElementById("login-form");
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const errorMsg = document.getElementById("error-msg");
const submitBtn = document.getElementById("submit-btn");
const toggleBtn = document.getElementById("toggle-password");
const eyeIcon = document.getElementById("eye-icon");
const eyeOffIcon = document.getElementById("eye-off-icon");

// ========================================
// Auth Guard: Redirect authenticated users
// ========================================
// If user already has a valid token in localStorage,
// redirect them to the dashboard (they shouldn't be on login page)
if (localStorage.getItem("auth_token")) {
  window.location.replace("/index.html");
}

/**
 * Toggle password visibility (show/hide) with icon change
 */
toggleBtn.addEventListener("click", () => {
  const isPassword = passwordEl.type === "password";
  passwordEl.type = isPassword ? "text" : "password"; // Toggle input type
  eyeIcon.classList.toggle("hidden", isPassword);    // Toggle eye icon
  eyeOffIcon.classList.toggle("hidden", !isPassword); // Toggle eye-off icon
});

/**
 * Display error message to user
 * @param {string} msg - Error message text
 */
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove("hidden");
}

/**
 * Hide error message
 */
function hideError() {
  errorMsg.classList.add("hidden");
}

/**
 * Update submit button state during API call
 * Shows loading indicator while request is in progress
 * @param {boolean} loading - True to show loading state, false to reset
 */
function setLoading(loading) {
  submitBtn.textContent = loading ? "Entrando..." : "Entrar"; // Update text
  submitBtn.disabled = loading;                               // Disable during request
  submitBtn.style.opacity = loading ? "0.6" : "";           // Visual feedback
}

/**
 * Handle login form submission
 * Validates email/password, sends them to API, and stores JWT token
 */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();

  // Extract and trim input values
  const email = emailEl.value.trim();
  const password = passwordEl.value;

  // Client-side validation: both fields required
  if (!email || !password) {
    showError("Preencha e-mail e senha.");
    if (!email) emailEl.classList.add("error");
    if (!password) passwordEl.classList.add("error");
    return;
  }

  // Clear error classes and show loading state
  [emailEl, passwordEl].forEach((el) => el.classList.remove("error"));
  setLoading(true);

  try {
    // POST credentials to API (URL from config.js)
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    // If API returns error (401, 400, 500, etc), throw exception
    if (!response.ok) {
      throw new Error("Credenciais inválidas");
    }

    // Extract JWT token from API response
    const data = await response.json();
    const token = data.token;

    // Store token in browser's localStorage for future requests
    localStorage.setItem("auth_token", token);

    // Redirect to dashboard on successful login
    window.location.replace("/index.html");
  } catch (error) {
    // Show error message and reset loading state
    showError("Erro ao conectar. Tente novamente.");
    setLoading(false);
  }
});

/**
 * Clear error state when user starts typing
 * Improves UX by removing error highlight as soon as user begins correcting input
 */
[emailEl, passwordEl].forEach((el) => {
  el.addEventListener("input", () => el.classList.remove("error"));
});
