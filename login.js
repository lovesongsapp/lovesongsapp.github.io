// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, fetchSignInMethodsForEmail } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCOed1uYtjzkR1OpYS6z3-sbIVPQW6MohM",
  authDomain: "lovesongs-1285e.firebaseapp.com",
  projectId: "lovesongs-1285e",
  storageBucket: "lovesongs-1285e.firebasestorage.app",
  messagingSenderId: "940749066428",
  appId: "1:940749066428:web:4bc067e8721fa576fe40b9",
  measurementId: "G-HLGV34NCB0"
};

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const provider = new GoogleAuthProvider();

// Função para registrar usuário
async function registerUser(email, password, username) {
  try {
    // Verifica se o email já está registrado
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    if (signInMethods.length > 0) {
      displayErrorMessage('Email já existe. Por favor, recupere sua senha.');
      return;
    }

    // Registra o novo usuário
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Adiciona os detalhes do usuário no Firestore
    await setDoc(doc(collection(db, 'users'), user.uid), {
      username: username,
      email: email,
      createdAt: serverTimestamp()
    });

    // Envia o email de verificação
    await user.sendEmailVerification();
    console.log('Email de verificação enviado para:', user.email);
    showSuccessMessage('Registro realizado com sucesso! Verifique seu e-mail para confirmar.');

    // Redireciona para a página de verificação (opcional)
    setTimeout(() => {
      window.location.href = '/verificacao.html'; // Crie esta página para instruir o usuário
    }, 3500);

  } catch (error) {
    displayErrorMessage(error.message);
  }
}

// Função para login do usuário
async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Verifica se o e-mail foi confirmado
    if (user.emailVerified) {
      console.log('Usuário logado com sucesso:', user);
      showSuccessMessage('Usuário logado com sucesso!');
      setTimeout(() => {
        window.location.href = '/sucesso.html';
      }, 3500);
    } else {
      displayErrorMessage('Seu e-mail ainda não foi verificado. Verifique sua caixa de entrada.');
      auth.signOut(); // Desloga o usuário
    }

  } catch (error) {
    displayErrorMessage(error.message);
  }
}

// Função para exibir mensagem de erro
function displayErrorMessage(errorMessage) {
  const errorMessageElement = document.getElementById('error-message');
  if (errorMessageElement) {
    errorMessageElement.textContent = errorMessage;
    errorMessageElement.classList.remove('hidden');
    errorMessageElement.classList.add('show');
  }
}

// Função para mostrar mensagem de sucesso
function showSuccessMessage(message) {
  const successMessageElement = document.getElementById('success-message');
  if (successMessageElement) {
    successMessageElement.textContent = message;
    successMessageElement.classList.remove('hidden');
    successMessageElement.classList.add('show');

    setTimeout(() => {
      successMessageElement.classList.remove('show');
      successMessageElement.classList.add('hidden');
    }, 5000); // Ocultar mensagem após 5 segundos
  }
}
