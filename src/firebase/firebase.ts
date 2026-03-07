// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDdaPS6z5KEiVKr0Nr1cXdmKtAxIG6rNO4",
  authDomain: "sfink-5fe77.firebaseapp.com",
  projectId: "sfink-5fe77",
  storageBucket: "sfink-5fe77.firebasestorage.app",
  messagingSenderId: "20905714148",
  appId: "1:20905714148:web:79f498a28395324107e7f1",
  measurementId: "G-EMYZ8Z9X7K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

export { app, auth, db, functions, storage };