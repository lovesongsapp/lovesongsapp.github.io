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
            if (!user.emailVerified) {
                auth.signOut();
                displayErrorMessage('Por favor, verifique seu email antes de continuar.');
                if (window.location.pathname !== '/login.html') {
                    window.location.href = '/login.html';
                }
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
        
        // Verifica email primeiro
        const emailExists = await checkEmailExists(email);
        if (emailExists) {
            displayErrorMessage('auth/email-already-in-use');
            return;
        }

        // Cria o usuáriousuário
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Envia email de verificação
        try {
            await sendEmailVerification(user);fication(user);
        } catch (error) {
            await auth.currentUser.delete();m-sucedido, salva os dados do usuário
            displayErrorMessage('auth/verification-email-failed');lection(db, 'users'), user.uid), {
            return;     username: username,
        }                email: email,
stamp(),
        // Salva dados do usuário no Firestore
        await setDoc(doc(collection(db, 'users'), user.uid), {
            username: username,
            email: email,
            createdAt: serverTimestamp(),e('Conta criada com sucesso! Verifique seu email para ativar sua conta.');
            emailVerified: false    
        });
nOut();
        showSuccessMessage('Conta criada! Por favor, verifique seu email para ativar sua conta.');
        mpa qualquer mensagem de erro
        // Faz logout do usuário após registro bem-sucedido            clearErrorMessage();
        await auth.signOut();
        
        // Redireciona após 3.5 segundos
        setTimeout(() => {                window.location.href = '/login.html';
            window.location.href = '/login.html';
        }, 3500);

    } catch (error) { remove o usuário
        console.error('Erro no registro:', error);
        let errorCode = error.code || 'auth/unknown-error';

        if (auth.currentUser) {
            try {    } catch (error) {
                // Remove o usuário se algo deu errado:', error);
                await auth.currentUser.delete();   
            } catch (deleteError) {       // Remove o usuário se ele existir e houver erro
                console.error('Erro ao remover usuário:', deleteError);        if (auth.currentUser) {
            }
        }elete();
   } catch (deleteError) {
        displayErrorMessage(errorCode);;
    }
}

// Adicionar função para verificar email existente (melhorada)nsagem de erro
async function checkEmailExists(email) {   if (error.message === 'Erro ao enviar email de verificação') {
    try {           displayErrorMessage('auth/verification-email-failed');
        const methods = await fetchSignInMethodsForEmail(auth, email);        } else {
        return methods && methods.length > 0;(error.code || 'auth/unknown-error');
    } catch (error) {
        console.error('Erro ao verificar email:', error);
        return false;
    }
}// Adicionar função para verificar email existente (melhorada)
ail) {
// Função para login do usuário
async function loginUser(email, password) {th, email);
    try {ods && methods.length > 0;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);ch (error) {
        const user = userCredential.user;        console.error('Erro ao verificar email:', error);

        if (!user.emailVerified) {
            await auth.signOut();
            displayErrorMessage('auth/email-not-verified');
            return;gin do usuário
        }ser(email, password) {

        console.log('Usuário logado com sucesso:', user);rd);
        showSuccessMessage('Usuário logado com sucesso!');   const user = userCredential.user;
        setTimeout(() => {
            window.location.href = '/sucesso.html';        if (!user.emailVerified) {
        }, 3500);();
    } catch (error) {/email-not-verified');
        console.error('Erro de login:', error); // Para debug   return;
        displayErrorMessage(error.code); // Usar error.code em vez de error.message
    }
}Usuário logado com sucesso:', user);
com sucesso!');
// Função para redefinir senha   setTimeout(() => {
async function resetPassword(email) {           window.location.href = '/sucesso.html';
    try {        }, 3500);
        await sendPasswordResetEmail(auth, email);
        showSuccessMessage('Enviamos um link para redefinir sua senha. Verifique seu email.');ra debug
    } catch (error) { de error.message
        displayErrorMessage(error.message);
    }
}

// Adiciona listeners para os formulários e botões
document.addEventListener('DOMContentLoaded', () => {    try {
    const registerForm = document.getElementById('register-form');ordResetEmail(auth, email);
    const loginForm = document.getElementById('login-form');nha. Verifique seu email.');
    const googleLoginButton = document.getElementById('google-login');
    const resetPasswordButton = document.getElementById('reset-password');
    const showRegisterButton = document.getElementById('show-register');
    const showLoginButton = document.getElementById('show-login');

    if (registerForm) { listeners para os formulários e botões
        registerForm.addEventListener('submit', async (event) => {ent.addEventListener('DOMContentLoaded', () => {
            event.preventDefault();    const registerForm = document.getElementById('register-form');
            const username = document.getElementById('register-username').value;= document.getElementById('login-form');
            const email = document.getElementById('register-email').value;ogin');
            const password = document.getElementById('register-password').value;ument.getElementById('reset-password');
            await registerUser(email, password, username);;
        });
    }
isterForm) {
    if (loginForm) {   registerForm.addEventListener('submit', async (event) => {
        loginForm.addEventListener('submit', async (event) => {            event.preventDefault();
            event.preventDefault(); document.getElementById('register-username').value;
            const email = document.getElementById('login-email').value;').value;
            const password = document.getElementById('login-password').value;t.getElementById('register-password').value;
            await loginUser(email, password); await registerUser(email, password, username);
        });   });
    }    }

    if (googleLoginButton) {
        googleLoginButton.addEventListener('click', async () => {
            await loginWithGoogle();
        });= document.getElementById('login-email').value;
    }ementById('login-password').value;
ginUser(email, password);
    if (resetPasswordButton) {
        resetPasswordButton.addEventListener('click', async () => {
            const email = document.getElementById('login-email').value;
            const errorMessage = document.getElementById('error-message');eLoginButton) {
            if (email) {gleLoginButton.addEventListener('click', async () => {
                await resetPassword(email);       await loginWithGoogle();
            } else {        });
                // Exibe a mensagem de erro personalizada
                errorMessage.style.display = 'block';
                errorMessage.innerText = 'Por favor, insira seu e-mail para redefinir sua senha.';
            }
        });
    } document.getElementById('error-message');
 if (email) {
    if (showRegisterButton) {           await resetPassword(email);
        showRegisterButton.addEventListener('click', (event) => {            } else {
            event.preventDefault(); mensagem de erro personalizada
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('register-form').style.display = 'block';ext = 'Por favor, insira seu e-mail para redefinir sua senha.';
            clearErrorMessage();
        });
    }

    if (showLoginButton) {f (showRegisterButton) {
        showLoginButton.addEventListener('click', (event) => {        showRegisterButton.addEventListener('click', (event) => {
            event.preventDefault();
            document.getElementById('register-form').style.display = 'none';play = 'none';
            document.getElementById('login-form').style.display = 'block';         document.getElementById('register-form').style.display = 'block';
            clearErrorMessage();            clearErrorMessage();
        });
    }

    togglePasswordVisibility('register-password', 'register-eye-icon');
    togglePasswordVisibility('login-password', 'eye-icon');tener('click', (event) => {
});
 'none';
// Função para alternar visibilidade da senha;
function togglePasswordVisibility(inputId, eyeIconId) {
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = document.getElementById(eyeIconId);
    if (passwordInput && eyeIcon) {
        eyeIcon.addEventListener('click', () => {    togglePasswordVisibility('register-password', 'register-eye-icon');
            const isPasswordVisible = passwordInput.type === 'text';-icon');
            passwordInput.type = isPasswordVisible ? 'password' : 'text';
            eyeIcon.setAttribute('name', isPasswordVisible ? 'eye-outline' : 'eye-off-outline');
        });lidade da senha
    }nputId, eyeIconId) {
}utId);
d);
// Função para exibir mensagem de erro (atualizada)passwordInput && eyeIcon) {
function displayErrorMessage(errorCode) {'click', () => {
    const errorMessageElement = document.getElementById('error-message');rdVisible = passwordInput.type === 'text';
    if (errorMessageElement) {
        // Remove mensagens antigasible ? 'eye-outline' : 'eye-off-outline');
        errorMessageElement.classList.remove('show');
        errorMessageElement.classList.add('hidden');
        
        // Adiciona nova mensagem
        setTimeout(() => {xibir mensagem de erro (atualizada)
            const message = errorMessages[errorCode] || `Erro: ${errorCode}`;ion displayErrorMessage(errorCode) {
            console.log('Código do erro:', errorCode);   const errorMessageElement = document.getElementById('error-message');
            errorMessageElement.textContent = message;    if (errorMessageElement) {
            errorMessageElement.style.display = 'block';
            errorMessageElement.classList.remove('hidden');assList.remove('show');
            errorMessageElement.classList.add('show');
        }, 100);
    }
}   setTimeout(() => {
           const message = errorMessages[errorCode] || `Erro: ${errorCode}`;
// Função para limpar mensagem de erro            console.log('Código do erro:', errorCode);
function clearErrorMessage() {essage;
    const errorMessageElement = document.getElementById('error-message');eElement.style.display = 'block';
    if (errorMessageElement) {
        errorMessageElement.textContent = '';
    }
}

// Mapeamento de mensagens de erro (atualizado)
const errorMessages = {
    'auth/invalid-credential': 'Credenciais inválidas. Por favor, verifique e tente novamente.',
    'auth/user-not-found': 'Usuário não encontrado. Por favor, verifique o email e tente novamente.',or-message');
    'auth/wrong-password': 'Senha incorreta. Por favor, tente novamente.',
    'auth/email-already-in-use': 'Este email já está registrado. Por favor, use outro email ou faça login.',
    'auth/email-not-verified': 'Por favor, verifique seu email antes de fazer login.',
    'auth/verification-pending': 'Verificação de email pendente. Verifique sua caixa de entrada.',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
    'auth/invalid-email': 'Email inválido. Por favor, verifique o formato do email.',
    'auth/operation-not-allowed': 'Operação não permitida.',
    'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',te novamente.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',e tente novamente.',
    'auth/email-verification-failed': 'Não foi possível enviar o email de verificação. Tente novamente.',
    'auth/verification-email-failed': 'Não foi possível enviar o email de verificação. Por favor, tente novamente mais tarde.', faça login.',
    'auth/network-error': 'Erro de conexão. Verifique sua internet e tente novamente.',
    'auth/invalid-verification-code': 'Código de verificação inválido. Tente novamente.',ua caixa de entrada.',
    'auth/unknown-error': 'Erro ao criar conta. Por favor, tente novamente.',
    'auth/invalid-continue-uri': 'Erro na configuração do email de verificação.', do email.',
    'auth/missing-continue-uri': 'Erro na configuração do email de verificação.',
    'auth/unauthorized-continue-uri': 'Erro na configuração do email de verificação.',e sua internet.',
    'auth/internal-error': 'Erro interno do servidor. Por favor, tente novamente mais tarde.',  'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    'auth/registration-failed': 'Erro ao completar o registro. Por favor, tente novamente.',    'auth/email-verification-failed': 'Não foi possível enviar o email de verificação. Tente novamente.',
    'auth/invalid-action-code': 'Link de verificação inválido ou expirado.', email de verificação. Tente novamente.',
    'auth/database-error': 'Erro ao salvar dados. Por favor, tente novamente.',ão. Verifique sua internet e tente novamente.',
    'auth/invalid-email-verified': 'Não foi possível verificar o email.',ido. Tente novamente.',
    'auth/email-verification-needed': 'É necessário verificar seu email antes de continuar.',or favor, tente novamente.',
    'default': 'Ocorreu um erro inesperado. Tente novamente.'/invalid-continue-uri': 'Erro na configuração do email de verificação.',
};th/missing-continue-uri': 'Erro na configuração do email de verificação.',
 'auth/unauthorized-continue-uri': 'Erro na configuração do email de verificação.',
document.addEventListener('DOMContentLoaded', () => {    'auth/internal-error': 'Erro interno do servidor. Por favor, tente novamente mais tarde.',







});    });        }            window.location.href = '/login.html';        if (!user && window.location.pathname !== '/login.html') {    onAuthStateChanged(auth, (user) => {    'auth/registration-failed': 'Erro ao completar o registro. Por favor, tente novamente.',
    'auth/invalid-action-code': 'Link de verificação inválido ou expirado.',
    'auth/database-error': 'Erro ao salvar dados. Por favor, tente novamente.',
    'auth/invalid-email-verified': 'Não foi possível verificar o email.',
    'auth/email-verification-needed': 'É necessário verificar seu email antes de continuar.',
    'default': 'Ocorreu um erro inesperado. Tente novamente.'
};

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (!user && window.location.pathname !== '/login.html') {
            window.location.href = '/login.html';
        }
    });
});
