// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCOed1uYtjzkR1OpYS6z3-sbIVPQW6MohM",
  authDomain: "lovesongs-1285e.firebaseapp.com",
  projectId: "lovesongs-1285e",
  storageBucket: "lovesongs-1285e.appspot.com",
  messagingSenderId: "940749066428",
  appId: "1:940749066428:web:4bc067e8721fa576fe40b9",
  measurementId: "G-HLGV34NCB0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Função para verificar o estado da autenticação
function checkAuthState() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Se o usuário já estiver autenticado, redireciona para a página de sucesso
      console.log('Usuário já autenticado:', user);
      window.location.href = '/login/sucesso.html';
    }
  });
}

// Chame a função para verificar a autenticação quando a página carregar
checkAuthState();

// Função para mostrar mensagem de sucesso
function showSuccessMessage(message) {
  const successMessageElement = document.getElementById('success-message');
  successMessageElement.textContent = message;
  successMessageElement.classList.remove('hidden');
  successMessageElement.classList.add('show');
  
  setTimeout(() => {
    successMessageElement.classList.remove('show');
    successMessageElement.classList.add('hidden');
  }, 5000); // Ocultar mensagem após 5 segundos
}

// Função para login com Google
async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log('Usuário conectado com o Google com sucesso:', user);
    showSuccessMessage('Usuário conectado com o Google com sucesso!');
    setTimeout(() => {
      window.location.href = '/login/sucesso.html';
    }, 3500); // Redirecionar após a mensagem ser exibida
  } catch (error) {
    displayErrorMessage(error.message);
  }
}

// Função para registrar usuário
async function registerUser(email, password, username) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(collection(db, 'users'), user.uid), {
      username: username,
      email: email,
      createdAt: serverTimestamp()
    });

    console.log('Usuário cadastrado com sucesso:', user);
    showSuccessMessage('Usuário cadastrado com sucesso!');
    setTimeout(() => {
      window.location.href = '/login/sucesso.html';
    }, 3500); // Redirecionar após a mensagem ser exibida
  } catch (error) {
    displayErrorMessage(error.message);
  }
}

// Função para login do usuário
async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Usuário logado com sucesso:', user);
    showSuccessMessage('Usuário logado com sucesso!');
    setTimeout(() => {
      window.location.href = '/login/sucesso.html';
    }, 3500); // Redirecionar após a mensagem ser exibida
  } catch (error) {
    displayErrorMessage(error.message);
  }
}

// Função para redefinir senha
async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    showSuccessMessage('Enviamos um link para redefinir sua senha. Verifique seu email.');
  } catch (error) {
    displayErrorMessage(error.message);
  }
}

// Adiciona listeners para os formulários e botões
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    await registerUser(email, password, username);
  });

  document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    await loginUser(email, password);
  });

  document.getElementById('google-login').addEventListener('click', async () => {
    await loginWithGoogle();
  });

  document.getElementById('reset-password').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    if (email) {
      await resetPassword(email);
    } else {
      alert('Por favor, insira seu email para redefinir sua senha.');
    }
  });

  document.getElementById('show-register').addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    clearErrorMessage();
  });

  document.getElementById('show-login').addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    clearErrorMessage();
  });

  togglePasswordVisibility('register-password', 'register-eye-icon');
  togglePasswordVisibility('login-password', 'eye-icon');
});

function togglePasswordVisibility(inputId, eyeIconId) {
  const passwordInput = document.getElementById(inputId);
  const eyeIcon = document.getElementById(eyeIconId);
  eyeIcon.addEventListener('click', () => {
    const isPasswordVisible = passwordInput.type === 'text';
    passwordInput.type = isPasswordVisible ? 'password' : 'text';
    eyeIcon.setAttribute('name', isPasswordVisible ? 'eye-outline' : 'eye-off-outline');
  });
}

function displayErrorMessage(errorCode) {
  const errorMessageElement = document.getElementById('error-message');
  const message = errorMessages[errorCode] || 'Ocorreu um erro. Por favor, tente novamente.';
  errorMessageElement.textContent = message;
  errorMessageElement.classList.remove('hidden');
  errorMessageElement.classList.add('show');
}

function clearErrorMessage() {
  const errorMessageElement = document.getElementById('error-message');
  errorMessageElement.textContent = '';
}
//mapeamento de mensagens de erro
const errorMessages = {
  'auth/invalid-credential': 'Credenciais inválidas. Por favor, verifique e tente novamente.',
  'auth/user-not-found': 'Usuário não encontrado. Por favor, verifique o email e tente novamente.',
  'auth/wrong-password': 'Senha incorreta. Por favor, tente novamente.',
  'auth/email-already-in-use': 'Este email já está em uso. Por favor, use outro email.',
  // Adicione outras mensagens de erro conforme necessário
};

// Função para verificar o estado da autenticação
function checkAuthState() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Se o usuário já estiver autenticado, continua na página principal
      console.log('Usuário já autenticado:', user);
    } else {
      // Se o usuário NÃO estiver autenticado, redireciona para a página de login
      console.log('Usuário não autenticado, redirecionando para a página de login.');
      window.location.href = '/login/login.html'; // Altere para o caminho correto da página de login
    }
  });
}

// Exporta a função para que possa ser usada em outras páginas
export { checkAuthState };
