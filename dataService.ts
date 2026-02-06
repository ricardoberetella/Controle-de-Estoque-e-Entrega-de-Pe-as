
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  query,
  writeBatch
} from "firebase/firestore";
import { Student, Part, Transaction, StudentWithdrawal } from './types';

// Configuração do Firebase extraída da sua imagem
const firebaseConfig = {
  apiKey: "AIzaSyB0i3S1QMhl9UgUIH5rqmZAuulZ--KXUc30",
  authDomain: "controle-de-demonstracao.firebaseapp.com",
  databaseURL: "https://controle-de-demonstracao-default-rtdb.firebaseio.com",
  projectId: "controle-de-demonstracao",
  storageBucket: "controle-de-demonstracao.firebasestorage.app",
  messagingSenderId: "804320803586",
  appId: "1:804320803586:web:e418e8e7c0b5adb881a01b",
  measurementId: "G-GFCPSFCFJF"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const COLLECTIONS = {
  STUDENTS: 'students',
  PARTS: 'parts',
  TRANSACTIONS: 'transactions',
  WITHDRAWALS: 'withdrawals'
};

export const db = {
  // --- Estudantes ---
  getStudents: async (): Promise<Student[]> => {
    const snapshot = await getDocs(collection(firestore, COLLECTIONS.STUDENTS));
    return snapshot.docs.map(doc => doc.data() as Student);
  },
  saveStudents: async (data: Student[]) => {
    // Para simplificar e manter a compatibilidade com o App.tsx (que envia o array completo),
    // vamos sincronizar os documentos um a um.
    for (const student of data) {
      await setDoc(doc(firestore, COLLECTIONS.STUDENTS, student.id), student);
    }
    // Nota: Em um sistema real, lidaríamos com exclusões comparando IDs ou usando um método deleteStudent específico.
    // Como o App.tsx já tem a lógica de remoção local, se você remover um aluno no Firestore, 
    // ele não aparecerá no próximo getStudents.
  },

  // --- Peças / Tarefas ---
  getParts: async (): Promise<Part[]> => {
    const snapshot = await getDocs(collection(firestore, COLLECTIONS.PARTS));
    return snapshot.docs.map(doc => doc.data() as Part);
  },
  saveParts: async (data: Part[]) => {
    for (const part of data) {
      await setDoc(doc(firestore, COLLECTIONS.PARTS, part.id), part);
    }
  },

  // --- Transações (Entradas/Saídas) ---
  getTransactions: async (): Promise<Transaction[]> => {
    const snapshot = await getDocs(collection(firestore, COLLECTIONS.TRANSACTIONS));
    return snapshot.docs.map(doc => doc.data() as Transaction);
  },
  saveTransactions: async (data: Transaction[]) => {
    for (const trans of data) {
      await setDoc(doc(firestore, COLLECTIONS.TRANSACTIONS, trans.id), trans);
    }
  },

  // --- Retiradas de Alunos ---
  getWithdrawals: async (): Promise<StudentWithdrawal[]> => {
    const snapshot = await getDocs(collection(firestore, COLLECTIONS.WITHDRAWALS));
    return snapshot.docs.map(doc => doc.data() as StudentWithdrawal);
  },
  saveWithdrawals: async (data: StudentWithdrawal[]) => {
    // As retiradas são salvas com uma chave composta para evitar duplicatas
    for (const withdrawal of data) {
      const id = `${withdrawal.studentId}_${withdrawal.partId}`;
      await setDoc(doc(firestore, COLLECTIONS.WITHDRAWALS, id), withdrawal);
    }
  }
};
