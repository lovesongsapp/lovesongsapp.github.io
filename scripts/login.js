import { auth, provider } from "./firebase.js";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Trocar formulários
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

document.getElementById("showRegister").onclick = () => {
  loginForm.style.display = "none";
  registerForm.style.display = "block";
};

document.getElementById("showLogin").onclick = () => {
  registerForm.style.display = "none";
  loginForm.style.display = "block";
};

// Login com Google
document.getElementById("googleLogin").onclick = () => {
  signInWithPopup(auth, provider)
    .then(() => window.location.href = "home.html")
    .catch(error => alert(error.message));
};

// Login com Email e Senha
document.getElementById("emailLogin").onclick = () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, pass)
    .then(() => window.location.href = "home.html")
    .catch(error => alert("Erro ao entrar: " + error.message));
};

// Cadastro de conta
document.getElementById("registerAccount").onclick = () => {
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    alert("As senhas não coincidem!");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => window.location.href = "home.html")
    .catch(error => alert("Erro ao cadastrar: " + error.message));
};

// Recuperar senha
document.getElementById("forgotPassword").onclick = () => {
  const email = document.getElementById("email").value;
  if (!email) return alert("Digite seu email para recuperar a senha!");

  sendPasswordResetEmail(auth, email)
    .then(() => alert("Verifique seu email para redefinir sua senha!"))
    .catch(error => alert("Erro: " + error.message));
};

// Mostrar/ocultar senha
const togglePassword = (inputId, iconId) => {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);

  icon.addEventListener("click", () => {
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    icon.name = isPassword ? "eye-off-outline" : "eye-outline";
  });
};

togglePassword("password", "toggleLoginPassword");
togglePassword("registerPassword", "toggleRegisterPassword");
