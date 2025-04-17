// scripts/login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCOed1uYtjzkR1OpYS6z3-sbIVPQW6MohM",
  authDomain: "lovesongs-1285e.firebaseapp.com",
  projectId: "lovesongs-1285e",
  appId: "1:940749066428:web:4bc067e8721fa576fe40b9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Mostrar/ocultar senha no login
document.getElementById("toggleLoginPassword").addEventListener("click", () => {
  const passInput = document.getElementById("password");
  const icon = document.getElementById("toggleLoginPassword");
  const isVisible = passInput.type === "text";
  passInput.type = isVisible ? "password" : "text";
  icon.name = isVisible ? "eye-outline" : "eye-off-outline";
});

// Mostrar/ocultar senha no cadastro
document.getElementById("toggleRegisterPassword").addEventListener("click", () => {
  const passInput = document.getElementById("registerPassword");
  const icon = document.getElementById("toggleRegisterPassword");
  const isVisible = passInput.type === "text";
  passInput.type = isVisible ? "password" : "text";
  icon.name = isVisible ? "eye-outline" : "eye-off-outline";
});

// Alternar para cadastro
document.getElementById("showRegister").addEventListener("click", () => {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registerForm").style.display = "block";
});

// Alternar para login
document.getElementById("showLogin").addEventListener("click", () => {
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
});

// Login com Google
document.getElementById("googleLogin").addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then(() => {
      localStorage.setItem("loggedIn", "true");
      window.location.href = "sucesso.html";
    })
    .catch(err => alert("Erro: " + err.message));
});

// Login com email/senha
document.getElementById("emailLogin").addEventListener("click", () => {
  const email = document.getElementById("email").value;
const pass = document.getElementById("registerPassword").value;

  if (email === "" || pass === "") {
    alert("Preencha todos os campos!");
    return;
  }

  signInWithEmailAndPassword(auth, email, pass)
    .then(() => {
      localStorage.setItem("loggedIn", "true");
      window.location.href = "sucesso.html";
    })
    .catch(err => alert("Erro: " + err.message));
});

// Recuperar senha
document.getElementById("forgotPassword").addEventListener("click", () => {
const email = document.getElementById("registerEmail").value;
  if (email === "") {
    alert("Por favor, insira seu e-mail.");
    return;
  }

  sendPasswordResetEmail(auth, email)
    .then(() => {
      alert("Link de redefinição de senha enviado para o seu e-mail!");
    })
    .catch(err => alert("Erro: " + err.message));
});

//email Manual e Alertas
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

document.getElementById("register").addEventListener("click", () => {
const email = document.getElementById("registerEmail").value;
const pass = document.getElementById("registerPassword").value;

  if (email === "" || pass === "") {
    alert("Preencha todos os campos para se cadastrar.");
    return;
  }

  createUserWithEmailAndPassword(auth, email, pass)
    .then(() => {
      alert("Conta criada com sucesso! Você já pode fazer login.");
      // window.location.href = "login.html";
    })
    .catch(err => {
      if (err.code === "auth/email-already-in-use") {
        alert("Este e-mail já está em uso. Tente recuperar a senha.");
      } else {
        alert("Erro ao cadastrar: " + err.message);
      }
    });
});
