import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYkWiAks40eJglEcSQQXiZb3OBaaDYCZw",
  authDomain: "sd2025law.firebaseapp.com",
  databaseURL: "https://sd2025law-default-rtdb.firebaseio.com",
  projectId: "sd2025law",
  storageBucket: "sd2025law.firebasestorage.app",
  messagingSenderId: "813089506227",
  appId: "1:813089506227:web:b473a0eaee4337a83b41c6",
  measurementId: "G-8ECGH3WP77"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app;
