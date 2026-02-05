import { ref, get, set } from "firebase/database";
import { rtdb } from "./firebaseConfig";
import { Part, Student, Transaction, StudentWithdrawal } from './types';
import { INITIAL_PARTS, INITIAL_STUDENTS } from './constants';

/**
 * DATABASE SERVICE (Firebase Realtime Database)
 * Este serviço gerencia a persistência de dados na nuvem.
 * Substitui o antigo localStorage para que os dados sejam globais.
 */
export const db = {
  // --- GESTÃO DE PEÇAS (ESTOQUE) ---
  async getParts(): Promise<Part[]> {
    const dbRef = ref(rtdb, 'parts');
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    // Caso o banco esteja vazio, envia os dados iniciais do arquivo constants.ts
    await this.saveParts(INITIAL_PARTS);
    return INITIAL_PARTS;
  },

  async saveParts(parts: Part[]): Promise<void> {
    await set(ref(rtdb, 'parts'), parts);
  },

  // --- GESTÃO DE ALUNOS ---
  async getStudents(): Promise<Student[]> {
    const dbRef = ref(rtdb, 'students');
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    // Inicializa com alunos padrão na primeira vez que o app rodar
    await this.saveStudents(INITIAL_STUDENTS);
    return INITIAL_STUDENTS;
  },

  async saveStudents(students: Student[]): Promise<void> {
    await set(ref(rtdb, 'students'), students);
  },

  // --- TRANSAÇÕES (ENTRADAS E SAÍDAS) ---
  async getTransactions(): Promise<Transaction[]> {
    const dbRef = ref(rtdb, 'transactions');
    const snapshot = await get(dbRef);
    return snapshot.exists() ? snapshot.val() : [];
  },

  async saveTransactions(transactions: Transaction[]): Promise<void> {
    await set(ref(rtdb, 'transactions'), transactions);
  },

  // --- RETIRADAS DE ALUNOS ---
  async getWithdrawals(): Promise<StudentWithdrawal[]> {
    const dbRef = ref(rtdb, 'withdrawals');
    const snapshot = await get(dbRef);
    return snapshot.exists() ? snapshot.val() : [];
  },

  async saveWithdrawals(withdrawals: StudentWithdrawal[]): Promise<void> {
    await set(ref(rtdb, 'withdrawals'), withdrawals);
  }
};
