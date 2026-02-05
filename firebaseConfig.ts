import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB0i38lQMhE9UgUIh5rqmZAuu1Z-KXUcI0",
  authDomain: "controle-de-demonstracao.firebaseapp.com",
  databaseURL: "https://controle-de-demonstracao-default-rtdb.firebaseio.com",
  projectId: "controle-de-demonstracao",
  storageBucket: "controle-de-demonstracao.firebasestorage.app",
  messagingSenderId: "804320803586",
  appId: "1:804320803586:web:e418e8e9c0b5adb881a01b",
  measurementId: "G-GFCPSFCFJF"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta a instância do Realtime Database para ser usada no dataService
export const rtdb = getDatabase(app);
