// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyAI0FPFuo8LWz3I5sSUTXDXqRDGaktGRM8",
  authDomain: "iferrorroastme.firebaseapp.com",
  projectId: "iferrorroastme",
  storageBucket: "iferrorroastme.firebasestorage.app",
  messagingSenderId: "465237272227",
  appId: "1:465237272227:web:c2a492471da5a36f558116"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();