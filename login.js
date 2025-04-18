// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
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

// Verificação de autenticação
function checkAuthState() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (window.location.pathname === '/login.html') {
        window.location.href = '/sucesso.html';
      }
    } else {
      if (window.location.pathname !== '/login.html') {
        window.location.href = '/login.html';
      }
    }
  });
}
checkAuthState();

// Mostrar mensagem de sucesso
function showSuccessMessage(message) {
  const successMessageElement = document.getElementById('success-message');
  if (successMessageElement) {
    successMessageElement.textContent = message;
    successMessageElement.classList.remove('hidden');
    successMessageElement.classList.add('show');
    setTimeout(() => {
      successMessageElement.classList.remove('show');
      successMessageElement.classList.add('hidden');
    }, 5000);
  }
}

// Login com Google
async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log('Usuário conectado com o Google com sucesso:', user);
    showSuccessMessage('Usuário conectado com o Google com sucesso!');
    setTimeout(() => {
      window.location.href = '/sucesso.html';
    }, 3500);
  } catch (error) {
    displayErrorMessage(error.message);
  }
}

// Registrar usuário
async function registerUser(email, password, username) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Envia e-mail de verificação
    await user.sendEmailVerification();

    await setDoc(doc(collection(db, 'users'), user.uid), {
      username: username,
      email: email,
      createdAt: serverTimestamp()
    });

    console.log('Usuário cadastrado com sucesso:', user);
    showSuccessMessage('Conta criada com sucesso! Verifique seu e-mail para ativar sua conta.');
    auth.signOut();
  } catch (error) {
    displayErrorMessage(error.message);
  }
}

// Login com e-mail/senha
async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (user.emailVerified) {
      console.log('Usuário logado com sucesso:', user);
      showSuccessMessage('Usuário logado com sucesso!');
      setTimeout(() => {
        window.location.href = '/sucesso.html';
      }, 3500);
    } else {
      displayErrorMessage('Seu e-mail ainda não foi verificado. Por favor, verifique sua caixa de entrada.');
      auth.signOut();
    }
  } catch (error) {
    displayErrorMessage(error.message);
  }
}

// Redefinir senha
async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    showSuccessMessage('Enviamos um link para redefinir sua senha. Verifique seu email.');
  } catch (error) {
    displayErrorMessage(error.message);
  }
}

// DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const googleLoginButton = document.getElementById('google-login');
  const resetPasswordButton = document.getElementById('reset-password');
  const showRegisterButton = document.getElementById('show-register');
  const showLoginButton = document.getElementById('show-login');

  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const username = document.getElementById('register-username').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      await registerUser(email, password, username);
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      await loginUser(email, password);
    });
  }

  if (googleLoginButton) {
    googleLoginButton.addEventListener('click', async () => {
      await loginWithGoogle();
    });
  }

  if (resetPasswordButton) {
    resetPasswordButton.addEventListener('click', async () => {
      const email = document.getElementById('login-email').value;
      const errorMessage = document.getElementById('error-message');
      if (email) {
        await resetPassword(email);
      } else {
        errorMessage.style.display = 'block';
        errorMessage.innerText = 'Por favor, insira seu e-mail para redefinir sua senha.';
      }
    });
  }

  if (showRegisterButton) {
    showRegisterButton.addEventListener('click', (event) => {
      event.preventDefault();
      document.getElementById('login-form').style.display = 'none';
      document.getElementById('register-form').style.display = 'block';
      clearErrorMessage();
    });
  }

  if (showLoginButton) {
    showLoginButton.addEventListener('click', (event) => {
      event.preventDefault();
      document.getElementById('register-form').style.display = 'none';
      document.getElementById('login-form').style.display = 'block';
      clearErrorMessage();
    });
  }

  togglePasswordVisibility('register-password', 'register-eye-icon');
  togglePasswordVisibility('login-password', 'eye-icon');
});

// Alternar visibilidade da senha
function togglePasswordVisibility(inputId, eyeIconId) {
  const passwordInput = document.getElementById(inputId);
  const eyeIcon = document.getElementById(eyeIconId);
  if (passwordInput && eyeIcon) {
    eyeIcon.addEventListener('click', () => {
      const isPasswordVisible = passwordInput.type === 'text';
      passwordInput.type = isPasswordVisible ? 'password' : 'text';
      eyeIcon.setAttribute('name', isPasswordVisible ? 'eye-outline' : 'eye-off-outline');
    });
  }
}

// Exibir mensagem de erro
function displayErrorMessage(errorCode) {
  const errorMessageElement = document.getElementById('error-message');
  const message = errorMessages[errorCode] || 'Ocorreu um erro. Por favor, tente novamente.';
  if (errorMessageElement) {
    errorMessageElement.textContent = message;
    errorMessageElement.classList.remove('hidden');
    errorMessageElement.classList.add('show');
  }
}

// Limpar mensagem de erro
function clearErrorMessage() {
  const errorMessageElement = document.getElementById('error-message');
  if (errorMessageElement) {
    errorMessageElement.textContent = '';
  }
}

// Mensagens de erro personalizadas
const errorMessages = {
  'auth/invalid-credential': 'Credenciais inválidas. Por favor, verifique e tente novamente.',
  'auth/user-not-found': 'Usuário não encontrado. Por favor, verifique o email e tente novamente.',
  'auth/wrong-password': 'Senha incorreta. Por favor, tente novamente.',
  'auth/email-already-in-use': 'Este email já está em uso. Por favor, use outro email.',
};
