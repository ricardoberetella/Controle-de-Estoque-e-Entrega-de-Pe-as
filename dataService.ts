
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";
import { Student, Part, Transaction, StudentWithdrawal } from './types';

// Configuração do Firebase extraída da sua imagem/anexo
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
const database = getDatabase(app);

const DB_PATHS = {
  STUDENTS: 'students',
  PARTS: 'parts',
  TRANSACTIONS: 'transactions',
  WITHDRAWALS: 'withdrawals'
};

const fetchData = async <T>(path: string, defaultValue: T): Promise<T> => {
  try {
    const snapshot = await get(ref(database, path));
    if (snapshot.exists()) {
      return snapshot.val() as T;
    }
    return defaultValue;
  } catch (error) {
    console.error(`Erro ao buscar ${path}:`, error);
    return defaultValue;
  }
};

const saveData = async <T>(path: string, data: T): Promise<void> => {
  try {
    await set(ref(database, path), data);
    console.log(`Dados gravados em ${path} com sucesso!`);
  } catch (error) {
    console.error(`Erro ao gravar em ${path}:`, error);
    throw error;
  }
};

export const db = {
  getStudents: async (): Promise<Student[]> => {
    return fetchData(DB_PATHS.STUDENTS, []);
  },
  saveStudents: async (data: Student[]) => {
    return saveData(DB_PATHS.STUDENTS, data);
  },
  getParts: async (): Promise<Part[]> => {
    const defaults: Part[] = [
      { id: 'T1', code: 'USI-001', name: 'Eixo de Transmissão', targetQuantity: 20 },
      { id: 'T2', code: 'USI-002', name: 'Bucha Cilíndrica', targetQuantity: 20 }
    ];
    return fetchData(DB_PATHS.PARTS, defaults);
  },
  saveParts: async (data: Part[]) => {
    return saveData(DB_PATHS.PARTS, data);
  },
  getTransactions: async (): Promise<Transaction[]> => {
    return fetchData(DB_PATHS.TRANSACTIONS, []);
  },
  saveTransactions: async (data: Transaction[]) => {
    return saveData(DB_PATHS.TRANSACTIONS, data);
  },
  getWithdrawals: async (): Promise<StudentWithdrawal[]> => {
    return fetchData(DB_PATHS.WITHDRAWALS, []);
  },
  saveWithdrawals: async (data: StudentWithdrawal[]) => {
    return saveData(DB_PATHS.WITHDRAWALS, data);
  }
};
