// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    sendPasswordResetEmail,
    fetchSignInMethodsForEmail,
    sendEmailVerification 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
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
            // Não exibe mensagem de erro durante o processo de registro
            if (!user.emailVerified && window.location.pathname !== '/login.html') {
                auth.signOut();
                window.location.href = '/login.html';
                return;
            }
            
            console.log('Usuário autenticado:', user);
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

// Função para registrar usuário (reescrita)
async function registerUser(email, password, username) {
    try {
        clearErrorMessage();
        
        // Desativa temporariamente o listener de auth state
        const unsubscribe = onAuthStateChanged(auth, () => {});
        
        // Verifica se o email já está em uso
        const emailExists = await checkEmailExists(email);
        if (emailExists) {
            displayErrorMessage('auth/email-already-in-use');
            unsubscribe();
            return;
        }

        // Cria o usuário
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Tenta enviar o email de verificação
        try {
            await sendEmailVerification(user);
        } catch (verificationError) {
            console.warn('Aviso: Não foi possível enviar o email de verificação imediatamente.', verificationError);
            // Continua o fluxo mesmo que o envio do email falhe
        }

        // Salva os dados do usuário no Firestore
        await setDoc(doc(collection(db, 'users'), user.uid), {
            username,
            email,
            createdAt: serverTimestamp(),
            emailVerified: false
        });

        // Exibe mensagem de sucesso e redireciona para a página de login
        showSuccessMessage('Conta criada com sucesso! Verifique seu email para ativar sua conta.');
        await auth.signOut();
        unsubscribe(); // Remove o listener temporário
        
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 3500);

    } catch (error) {
        console.error('Erro no registro:', error);

        // Remove o usuário se algo deu errado
        if (auth.currentUser) {
            try {
                await auth.currentUser.delete();
            } catch (deleteError) {
                console.error('Erro ao remover usuário:', deleteError);
            }
        }

        displayErrorMessage(error.code || 'auth/unknown-error');
    }
}

// Adicionar função para verificar email existente (melhorada)
async function checkEmailExists(email) {
    try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        return methods && methods.length > 0;
    } catch (error) {
        console.error('Erro ao verificar email:', error);
        return false;
    }
}

// Função para login do usuário
async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
            await auth.signOut();
            displayErrorMessage('auth/email-not-verified');
            return;
        }

        showSuccessMessage('Usuário logado com sucesso!');
        setTimeout(() => {
            window.location.href = '/sucesso-user.html';
        }, 3500);

    } catch (error) {
        console.error('Erro de login:', error);
        displayErrorMessage(error.code || 'auth/unknown-error');
    }
}

// Função para redefinir senha
async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        showSuccessMessage('Enviamos um link para redefinir sua senha. Verifique seu email.');
    } catch (error) {
        displayErrorMessage(error.code || 'auth/unknown-error');
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
                errorMessage.style.display = 'block';
                errorMessage.innerText = 'Por favor, insira seu e-mail para redefinir sua senha.';
                
                // Adiciona temporizador para remover a mensagem após 10 segundos
                setTimeout(() => {
                    errorMessage.style.display = 'none';
                    errorMessage.innerText = '';
                }, 10000);
            }
        });
    }

    if (showRegisterButton) {
        showRegisterButton.addEventListener('click', (event) => {
            event.preventDefault();
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('register-form').style.display = 'block';
            document.getElementById('show-register').style.display = 'none';
            document.getElementById('show-login').style.display = 'block';
            clearErrorMessage();
        });
    }

    if (showLoginButton) {
        showLoginButton.addEventListener('click', (event) => {
            event.preventDefault();
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
            document.getElementById('show-login').style.display = 'none';
            document.getElementById('show-register').style.display = 'block';
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

// Função para exibir mensagem de erro (atualizada)
function displayErrorMessage(errorCode) {
    const errorMessageElement = document.getElementById('error-message');
    if (errorMessageElement) {
        const message = errorMessages[errorCode] || `Erro: ${errorCode}`;
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';
    }
}

// Função para limpar mensagem de erro
function clearErrorMessage() {
    const errorMessageElement = document.getElementById('error-message');
    if (errorMessageElement) {
        errorMessageElement.textContent = '';
        errorMessageElement.style.display = 'none';
    }
}

// Mapeamento de mensagens de erro (atualizado)
const errorMessages = {
    'auth/email-already-in-use': 'Este email já está registrado. Por favor, use outro email ou faça login.',
    'auth/email-not-verified': 'Por favor, verifique seu email antes de fazer login.',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
    'auth/invalid-email': 'Email inválido. Por favor, verifique o formato do email.',
    'auth/unknown-error': 'Ocorreu um erro inesperado. Tente novamente.',
    'auth/verification-email-failed': 'Erro ao enviar email de verificação. Tente novamente.',
    'auth/user-not-found': 'Usuário não encontrado. Por favor, verifique o email e tente novamente.',
    'auth/wrong-password': 'Senha incorreta. Por favor, tente novamente.'
};

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (!user && window.location.pathname !== '/login.html') {
            window.location.href = '/login.html';
        }
    });
});
