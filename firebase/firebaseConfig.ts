import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAXvvtARspEBlCzrVTQP2HumrwS9Eeephs",
  authDomain: "rastreamento-mp.firebaseapp.com",
  projectId: "rastreamento-mp",
  storageBucket: "rastreamento-mp.firebasestorage.app",
  messagingSenderId: "487191843461",
  appId: "1:487191843461:web:7ce7206579866e21ba8fec",
  // measurementId: "G-SC3M7Y2FBZ" // não precisa no mobile
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); 
export const db = getFirestore(app); // export do Firestore para ser usado em outros arquivos