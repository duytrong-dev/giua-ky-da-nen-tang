// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDqweG9JWDUQ1tu1xyViIa_JdoUq9ibi1I",
  authDomain: "giua-ky-349db.firebaseapp.com",
  projectId: "giua-ky-349db",
  storageBucket: "giua-ky-349db.firebasestorage.app",
  messagingSenderId: "883151717509",
  appId: "1:883151717509:web:54c4bc8361f8c056a1d5ec",
  measurementId: "G-X0B2XKRZSC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);