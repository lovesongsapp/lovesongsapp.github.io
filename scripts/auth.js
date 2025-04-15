// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCOed1uYtjzkR1OpYS6z3-sbIVPQW6MohM",
  authDomain: "lovesongs-1285e.firebaseapp.com",
  projectId: "lovesongs-1285e",
  appId: "1:940749066428:web:4bc067e8721fa576fe40b9"
};

// Inicializa o Firebase se ainda não estiver inicializado
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Verifica autenticação do usuário
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    console.log("Usuário não autenticado. Redirecionando para login.");
    window.location.href = "/login.html";
  } else {
    console.log("Usuário autenticado:", user.email);
    localStorage.setItem("userLogged", "true");
  }
});
