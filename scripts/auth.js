//Controle de autenticação
// scripts/auth.js
//import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
//import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// Firebase config (use a sua aqui)
const firebaseConfig = {
  apiKey: "AIzaSyCOed1uYtjzkR1OpYS6z3-sbIVPQW6MohM",
  authDomain: "lovesongs-1285e.firebaseapp.com",
  projectId: "lovesongs-1285e",
  appId: "1:940749066428:web:4bc067e8721fa576fe40b9"
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

// Inicializa o Firebase apenas se ainda não foi inicializado

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Verifica o estado da autenticação
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    // Usuário não autenticado, redireciona para a página de login
    window.location.href = "login.html";
  } else {
    console.log("Usuário autenticado:", user.email);
    // Se quiser, você pode armazenar dados aqui
    localStorage.setItem('userLogged', 'true');
  }
});
