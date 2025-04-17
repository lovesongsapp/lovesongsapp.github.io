// auth.js
import { auth, provider } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged // ✅ Importação necessária para evitar erro!
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const googleBtn = document.getElementById("google-login");
const errorMessage = document.getElementById("error-message");

//redefini senha
const resetPasswordLink = document.getElementById("reset-password");

resetPasswordLink?.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = prompt("Digite seu e-mail para redefinir a senha:");
  if (!email) return;

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Enviamos um link de redefinição para seu e-mail.");
  } catch (error) {
    alert("Erro ao enviar o email de redefinição: " + error.message);
  }
});
// Login com email e senha
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "index.html";
  } catch (error) {
    errorMessage.textContent = error.message;
  }
});

// Cadastro com email e senha
registerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    window.location.href = "sucesso.html";
  } catch (error) {
    errorMessage.textContent = error.message;
  }
});

// Login com conta Google
googleBtn?.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
    window.location.href = "index.html";
  } catch (error) {
    errorMessage.textContent = error.message;
  }
});

// Proteção de rota: redireciona para login se o usuário não estiver autenticado
onAuthStateChanged(auth, (user) => {
  if (!user && window.location.pathname === "/index.html") {
    window.location.href = "/login.html";
  }
});
