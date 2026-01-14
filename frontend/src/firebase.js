// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "Replace with your config values",
    authDomain: "Replace with your config values",
    projectId: "Replace with your config values",
    storageBucket: "aReplace with your config values",
    messagingSenderId: "Replace with your config values",
    appId: "Replace with your config values",
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
