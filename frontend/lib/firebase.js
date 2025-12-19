import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCw4tM3Wm8Rh3sPOjuL7NR4WKwNvCHzuhs",
    authDomain: "inventory-85ce1.firebaseapp.com",
    projectId: "inventory-85ce1",
    storageBucket: "inventory-85ce1.firebasestorage.app",
    messagingSenderId: "626439210536",
    appId: "1:626439210536:web:6551d6b3a6270d6c51571d",
    measurementId: "G-6LR3KH35P7"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { auth };
