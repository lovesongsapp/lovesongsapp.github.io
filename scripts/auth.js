//Controle de autenticação
// scripts/auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// Firebase config (use a sua aqui)
const firebaseConfig = {
  apiKey: "SUA_KEY",
  authDomain: "SUA_AUTH_DOMAIN",
  projectId: "SUA_PROJECT_ID",
  appId: "SUA_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Protege a página inicial
function checkAuthAndRedirect() {
  onAuthStateChanged(auth, user => {
    if (!user) {
      // Redireciona se não estiver logado
      window.location.href = "/login.html";
    } else {
      // Salva login local para persistência
      localStorage.setItem("loggedIn", "true");
    }
  });
}

checkAuthAndRedirect();
