
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
