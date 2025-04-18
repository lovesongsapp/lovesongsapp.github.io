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


// Função para verificar o estado da autenticação
function checkAuthState() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('Usuário já autenticado:', user);
      // Redirecionar para a página sucesso apenas se não estiver na página inicial
      if (window.location.pathname === '/login.html') {
        window.location.href = '/sucesso.html';
      }
    } else {
      // Se o usuário não estiver autenticado e não estiver na página de login, redireciona para login
      if (window.location.pathname !== '/login.html') {
        window.location.href = '/login.html';
      }
    }
  });
}

// Chama a função para verificar a autenticação quando a página carrega
checkAuthState();

//fim da onda

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

// Função para login com Google
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

//novo star
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
//novo end

// Função para login do usuário
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
      auth.signOut(); // desloga o usuário se o e-mail não estiver verificado
    }

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
        // Exibe a mensagem de erro personalizada
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

// Função para alternar visibilidade da senha
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

// Função para exibir mensagem de erro
function displayErrorMessage(errorCode) {
  const errorMessageElement = document.getElementById('error-message');
  const message = errorMessages[errorCode] || 'Ocorreu um erro. Por favor, tente novamente.';
  if (errorMessageElement) {
    errorMessageElement.textContent = message;
    errorMessageElement.classList.remove('hidden');
    errorMessageElement.classList.add('show');
  }
}

// Função para limpar mensagem de erro
function clearErrorMessage() {
  const errorMessageElement = document.getElementById('error-message');
  if (errorMessageElement) {
    errorMessageElement.textContent = '';
  }
}

// Mapeamento de mensagens de erro
const errorMessages = {
  'auth/invalid-credential': 'Credenciais inválidas. Por favor, verifique e tente novamente.',
  'auth/user-not-found': 'Usuário não encontrado. Por favor, verifique o email e tente novamente.',
  'auth/wrong-password': 'Senha incorreta. Por favor, tente novamente.',
  'auth/email-already-in-use': 'Este email já está em uso. Por favor, use outro email.',
};

document.addEventListener('DOMContentLoaded', () => {
  // Exemplo para Firebase Authentication:
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      // Redireciona o usuário para a página de login caso não esteja logado
      window.location.href = "login.html";
    }
  });

  // Se estiver usando uma outra lógica de autenticação:
  // Verifique se o token ou a sessão de login existe no localStorage ou sessionStorage
  const isLoggedIn = localStorage.getItem("userLoggedIn"); // ou sessionStorage
  if (!isLoggedIn) {
    window.location.href = "login.html";
  }
});

//end
