// auth.js
import { auth } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

// Login com e-mail e senha
export function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Cadastro com e-mail e senha
export function registerUser(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

// Redefinir senha
export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

// Login com Google
export function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}
