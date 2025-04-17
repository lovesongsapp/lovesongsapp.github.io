import { auth, provider } from "./firebase.js";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Alternar formulários
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

document.getElementById("showRegister").addEventListener("click", () => {
  loginForm.style.display = "none";
  registerForm.style.display = "block";
});

document.getElementById("showLogin").addEventListener("click", () => {
  registerForm.style.display = "none";
  loginForm.style.display = "block";
});

// Login com Google
document.getElementById("googleLogin").addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then(() => window.location.href = "home.html")
    .catch(error => alert("Erro no login com Google: " + error.message));
});

// Login com Email/Senha
document.getElementById("emailLogin").addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => window.location.href = "home.html")
    .catch(error => alert("Erro ao entrar: " + error.message));
});

// Cadastro
document.getElementById("registerAccount").addEventListener("click", () => {
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    alert("As senhas não coincidem!");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => window.location.href = "home.html")
    .catch(error => alert("Erro ao cadastrar: " + error.message));
});

// Recuperar senha
document.getElementById("forgotPassword").addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  if (!email) {
    alert("Digite seu email para redefinir a senha.");
    return;
  }

  sendPasswordResetEmail(auth, email)
    .then(() => alert("Enviamos um link de redefinição para seu email."))
    .catch(error => alert("Erro: " + error.message));
});

// Alternar visibilidade da senha
function togglePassword(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);

  icon.addEventListener("click", () => {
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    icon.name = show ? "eye-off-outline" : "eye-outline";
  });
}

togglePassword("password", "toggleLoginPassword");
togglePassword("registerPassword", "toggleRegisterPassword");
