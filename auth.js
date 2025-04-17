// auth.js
import { auth, provider } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const googleBtn = document.getElementById("google-login");
const errorMessage = document.getElementById("error-message");

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

registerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    window.location.href = "index.html";
  } catch (error) {
    errorMessage.textContent = error.message;
  }
});

googleBtn?.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
    window.location.href = "index.html";
  } catch (error) {
    errorMessage.textContent = error.message;
  }
});

// Proteção de rota: se o usuário não estiver logado e tentar acessar index.html, redireciona para login
onAuthStateChanged(auth, (user) => {
  if (!user && window.location.pathname === '/index.html') {
    window.location.href = '/login.html';
  }
});
