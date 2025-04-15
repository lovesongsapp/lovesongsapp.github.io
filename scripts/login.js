// scripts/login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "SUA_KEY",
  authDomain: "SUA_AUTH_DOMAIN",
  projectId: "SUA_PROJECT_ID",
  appId: "SUA_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.getElementById("googleLogin").addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then(() => {
      localStorage.setItem("loggedIn", "true");
      window.location.href = "sucesso.html";
    })
    .catch(err => alert("Erro: " + err.message));
});

document.getElementById("emailLogin").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, pass)
    .then(() => {
      localStorage.setItem("loggedIn", "true");
      window.location.href = "sucesso.html";
    })
    .catch(err => alert("Erro: " + err.message));
});

// Mostrar/ocultar senha
document.getElementById("togglePassword").addEventListener("click", () => {
  const passInput = document.getElementById("password");
  const icon = document.getElementById("togglePassword");
  const isVisible = passInput.type === "text";
  passInput.type = isVisible ? "password" : "text";
  icon.name = isVisible ? "eye-outline" : "eye-off-outline";
});
