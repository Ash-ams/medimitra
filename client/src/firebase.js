// client/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, signOut, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMlZYOkH7_UusE8lVO6jTtqi9aAxpzZY0",
  authDomain: "ai-doctor-app-55b2f.firebaseapp.com",
  projectId: "ai-doctor-app-55b2f",
  storageBucket: "ai-doctor-app-55b2f.appspot.com",
  messagingSenderId: "482886564692",
  appId: "1:482886564692:web:8272e2fd6b2ca7d92566c1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// services
const auth = getAuth(app);

// Set persistence to session only (no auto-login)
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log("Firebase auth set to session persistence");
  })
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

const db = getFirestore(app);

// Export both
export { auth, db, signOut };
