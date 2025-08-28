import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

const firebaseConfig = {
  apiKey: "AIzaSyCYkWiAks40eJglEcSQQXiZb3OBaaDYCZw",
  authDomain: "sd2025law.firebaseapp.com",
  databaseURL: "https://sd2025law-default-rtdb.firebaseio.com",
  projectId: "sd2025law",
  storageBucket: "sd2025law.appspot.com",
  messagingSenderId: "813089506227",
  appId: "1:813089506227:web:b473a0eaee4337a83b41c6",
  measurementId: "G-8ECGH3WP77"
};

const app = initializeApp(firebaseConfig);

// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); 

export { app, auth, db, storage };
