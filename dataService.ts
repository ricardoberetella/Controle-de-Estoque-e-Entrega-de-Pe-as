import { rtdb } from './firebaseConfig';
import { ref, get, set } from 'firebase/database';
import { Part, Student, Transaction, StudentWithdrawal } from './types';
import { INITIAL_PARTS, INITIAL_STUDENTS } from './constants';

export const db = {
  async getParts(): Promise<Part[]> {
    const snapshot = await get(ref(rtdb, 'parts'));
    return snapshot.exists() ? snapshot.val() : INITIAL_PARTS;
  },

  async saveParts(parts: Part[]): Promise<void> {
    await set(ref(rtdb, 'parts'), parts);
  },

  async getStudents(): Promise<Student[]> {
    const snapshot = await get(ref(rtdb, 'students'));
    return snapshot.exists() ? snapshot.val() : INITIAL_STUDENTS;
  },

  async saveStudents(students: Student[]): Promise<void> {
    await set(ref(rtdb, 'students'), students);
  },

  async getTransactions(): Promise<Transaction[]> {
    const snapshot = await get(ref(rtdb, 'transactions'));
    return snapshot.exists() ? snapshot.val() : [];
  },

  async saveTransactions(transactions: Transaction[]): Promise<void> {
    await set(ref(rtdb, 'transactions'), transactions);
  },

  async getWithdrawals(): Promise<StudentWithdrawal[]> {
    const snapshot = await get(ref(rtdb, 'withdrawals'));
    return snapshot.exists() ? snapshot.val() : [];
  },

  async saveWithdrawals(withdrawals: StudentWithdrawal[]): Promise<void> {
    await set(ref(rtdb, 'withdrawals'), withdrawals);
  }
};
