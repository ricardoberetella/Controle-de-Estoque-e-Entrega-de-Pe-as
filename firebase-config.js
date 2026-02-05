import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB0i3BlQMhE9UgUiH5rqmZAuu1Z-KXUcI0",
  authDomain: "controle-de-demonstracao.firebaseapp.com",
  databaseURL: "https://controle-de-demonstracao-default-rtdb.firebaseio.com",
  projectId: "controle-de-demonstracao",
  storageBucket: "controle-de-demonstracao.appspot.com",
  messagingSenderId: "804320803586",
  appId: "1:804320803586:web:e418e8e9c0b5adb8b1a01b"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
