import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0i38lQMhE9UgUIh5rqmZAuu1Z-KXUcI0",
  authDomain: "controle-de-demonstracao.firebaseapp.com",
  projectId: "controle-de-demonstracao",
  storageBucket: "controle-de-demonstracao.firebasestorage.app",
  messagingSenderId: "804320803586",
  appId: "1:804320803586:web:e418e8e9c0b5adb881a01b"
};

const app = initializeApp(firebaseConfig);
export const db_firestore = getFirestore(app);
