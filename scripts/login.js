// scripts/login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCOed1uYtjzkR1OpYS6z3-sbIVPQW6MohM",
  authDomain: "lovesongs-1285e.firebaseapp.com",
  projectId: "lovesongs-1285e",
  appId: "1:940749066428:web:4bc067e8721fa576fe40b9"
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
