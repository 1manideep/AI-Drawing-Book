// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCUzo3V_sKo5mct8RzwQHcabLsVJvM2tw4",
    authDomain: "ai-drawing-book.firebaseapp.com",
    projectId: "ai-drawing-book",
    storageBucket: "ai-drawing-book.firebasestorage.app",
    messagingSenderId: "765458158460",
    appId: "1:765458158460:web:50fea15c2e365fc32ccaf9",
    measurementId: "G-RW8NZD650S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, googleProvider, db, storage };
