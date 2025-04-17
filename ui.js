// ui.js
const toggleToRegister = document.getElementById("switch-to-register");
const toggleToLogin = document.getElementById("switch-to-login");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const title = document.getElementById("form-title");

toggleToRegister?.addEventListener("click", () => {
  loginForm.style.display = "none";
  registerForm.style.display = "block";
  document.getElementById("toggle-register").style.display = "none";
  document.getElementById("toggle-login").style.display = "block";
  title.textContent = "Cadastrar";
});

toggleToLogin?.addEventListener("click", () => {
  loginForm.style.display = "block";
  registerForm.style.display = "none";
  document.getElementById("toggle-register").style.display = "block";
  document.getElementById("toggle-login").style.display = "none";
  title.textContent = "Entrar";
});

const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
togglePassword?.addEventListener("click", () => {
  const type = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = type;
  togglePassword.name = type === "password" ? "eye-outline" : "eye-off-outline";
});

const toggleRegPassword = document.getElementById("toggleRegPassword");
const regPasswordInput = document.getElementById("reg-password");
toggleRegPassword?.addEventListener("click", () => {
  const type = regPasswordInput.type === "password" ? "text" : "password";
  regPasswordInput.type = type;
  toggleRegPassword.name = type === "password" ? "eye-outline" : "eye-off-outline";
});
