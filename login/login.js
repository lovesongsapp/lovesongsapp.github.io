// Firebase configuration and initialization
const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID",
  storageBucket: "PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID",
  measurementId: "G-MEASUREMENT_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Registration function
async function registerUser(email, password, username) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(collection(db, 'users'), user.uid), {
      username: username,
      email: email,
      createdAt: serverTimestamp()
    });

    console.log('User registered successfully:', user);
    alert('User registered successfully!');
    window.location.href = 'sucesso.html';
  } catch (error) {
    console.error('Error registering user:', error.message);
    alert('Error registering user: ' + error.message);
  }
}

// Login function
async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('User logged in successfully:', user);
    alert('User logged in successfully!');
    window.location.href = 'sucesso.html';
  } catch (error) {
    console.error('Error logging in user:', error.message);
    alert('Error logging in user: ' + error.message);
  }
}

// Google login function
async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log('User logged in with Google successfully:', user);
    alert('User logged in with Google successfully!');
    window.location.href = 'sucesso.html';
  } catch (error) {
    console.error('Error logging in with Google:', error.message);
    alert('Error logging in with Google: ' + error.message);
  }
}

// Event listeners for form submissions and button clicks
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

document.getElementById('show-register').addEventListener('click', () => {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'block';
});

document.getElementById('show-login').addEventListener('click', () => {
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('login-form').style.display = 'block';
});

function togglePasswordVisibility() {
  const passwordInput = document.getElementById('register-password');
  const eyeIcon = document.getElementById('eye-icon');

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeIcon.name = 'eye-off-outline';
  } else {
    passwordInput.type = 'password';
    eyeIcon.name = 'eye-outline';
  }
}

document.getElementById('eye-icon').addEventListener('click', togglePasswordVisibility);

// Password reset function
async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    alert('Enviamos um link para redefinir sua senha. Verifique seu email.');
  } catch (error) {
    console.error('Error resetting password:', error.message);
    alert('Error resetting password: ' + error.message);
  }
}

document.getElementById('reset-password').addEventListener('click', async () => {
  const email = document.getElementById('login-email').value;
  if (email) {
    await resetPassword(email);
  } else {
    alert('Por favor, insira seu email para redefinir sua senha.');
  }
});
