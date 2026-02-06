
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc,
  writeBatch
} from "firebase/firestore";
import { Student, Part, Transaction, StudentWithdrawal } from './types';

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
  saveStudent: async (student: Student) => {
    await setDoc(doc(firestore, COLLECTIONS.STUDENTS, student.id), student);
  },
  deleteStudent: async (id: string) => {
    await deleteDoc(doc(firestore, COLLECTIONS.STUDENTS, id));
  },

  // --- Peças / Tarefas ---
  getParts: async (): Promise<Part[]> => {
    const snapshot = await getDocs(collection(firestore, COLLECTIONS.PARTS));
    return snapshot.docs.map(doc => doc.data() as Part);
  },
  savePart: async (part: Part) => {
    await setDoc(doc(firestore, COLLECTIONS.PARTS, part.id), part);
  },
  deletePart: async (id: string, associatedWithdrawals: StudentWithdrawal[]) => {
    const batch = writeBatch(firestore);
    // Remove a peça
    batch.delete(doc(firestore, COLLECTIONS.PARTS, id));
    // Remove as retiradas associadas a esta peça
    associatedWithdrawals.filter(w => w.partId === id).forEach(w => {
      const withdrawalId = `${w.studentId}_${w.partId}`;
      batch.delete(doc(firestore, COLLECTIONS.WITHDRAWALS, withdrawalId));
    });
    await batch.commit();
  },

  // --- Transações ---
  getTransactions: async (): Promise<Transaction[]> => {
    const snapshot = await getDocs(collection(firestore, COLLECTIONS.TRANSACTIONS));
    return snapshot.docs.map(doc => doc.data() as Transaction);
  },
  saveTransaction: async (trans: Transaction) => {
    await setDoc(doc(firestore, COLLECTIONS.TRANSACTIONS, trans.id), trans);
  },
  deleteTransaction: async (id: string) => {
    await deleteDoc(doc(firestore, COLLECTIONS.TRANSACTIONS, id));
  },

  // --- Retiradas ---
  getWithdrawals: async (): Promise<StudentWithdrawal[]> => {
    const snapshot = await getDocs(collection(firestore, COLLECTIONS.WITHDRAWALS));
    return snapshot.docs.map(doc => doc.data() as StudentWithdrawal);
  },
  saveWithdrawal: async (withdrawal: StudentWithdrawal) => {
    const id = `${withdrawal.studentId}_${withdrawal.partId}`;
    await setDoc(doc(firestore, COLLECTIONS.WITHDRAWALS, id), withdrawal);
  },
  deleteWithdrawal: async (studentId: string, partId: string) => {
    const id = `${studentId}_${partId}`;
    await deleteDoc(doc(firestore, COLLECTIONS.WITHDRAWALS, id));
  }
};
