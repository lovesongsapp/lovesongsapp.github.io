import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Config Firebase (usa o do LoveSongs)
const firebaseConfig = {
  apiKey: "AIzaSyCOed1uYtjzkR1OpYS6z3-sbIVPQW6MohM",
  authDomain: "lovesongs-1285e.firebaseapp.com",
  projectId: "lovesongs-1285e",
  storageBucket: "lovesongs-1285e.firebasestorage.app",
  messagingSenderId: "940749066428",
  appId: "1:940749066428:web:4bc067e8721fa576fe40b9",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const welcomeEl = document.getElementById("user-welcome");
const goHomeBtn = document.getElementById("go-home");
const countdownEl = document.getElementById("countdown");

onAuthStateChanged(auth, (user) => {
  if (user) {
    welcomeEl.textContent = `Olá, ${user.displayName || user.email}!`;
  } else {
    // Não autenticado? Manda pra login
    window.location.href = "/login.html";
  }
});

goHomeBtn.addEventListener("click", () => {
  window.location.href = "/index.html"; // ou onde for a home
});

// Redirecionamento automático
let countdown = 10;
const timer = setInterval(() => {
  countdown--;
  countdownEl.textContent = countdown;
  if (countdown === 0) {
    clearInterval(timer);
    window.location.href = "/index.html";
  }
}, 1000);
