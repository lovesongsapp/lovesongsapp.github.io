  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-analytics.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
  import { getFirestore, collection, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCOed1uYtjzkR1OpYS6z3-sbIVPQW6MohM",
    authDomain: "lovesongs-1285e.firebaseapp.com",
    projectId: "lovesongs-1285e",
    storageBucket: "lovesongs-1285e.appspot.com",
    messagingSenderId: "940749066428",
    appId: "1:940749066428:web:4bc067e8721fa576fe40b9",
    measurementId: "G-HLGV34NCB0"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

  // Initialize Firebase Authentication and Firestore
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Function to register a new user
  async function registerUser(email, password, username) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user info to Firestore
      await setDoc(doc(collection(db, 'users'), user.uid), {
        username: username,
        email: email,
        createdAt: serverTimestamp()
      });

      console.log('User registered successfully:', user);
    } catch (error) {
      console.error('Error registering user:', error.message);
    }
  }

  // Function to login a user
  async function loginUser(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User logged in successfully:', user);
    } catch (error) {
      console.error('Error logging in user:', error.message);
    }
  }

  // Example usage
  // registerUser('user@example.com', 'securePassword123', 'usernameExample');
  // loginUser('user@example.com', 'securePassword123');
