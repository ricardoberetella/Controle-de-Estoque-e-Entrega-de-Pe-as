
import { Student, Part, Transaction, StudentWithdrawal } from './types';

const STORAGE_KEYS = {
  STUDENTS: 'usinagem_students',
  PARTS: 'usinagem_parts',
  TRANSACTIONS: 'usinagem_transactions',
  WITHDRAWALS: 'usinagem_withdrawals'
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const db = {
  getStudents: async (): Promise<Student[]> => {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return data ? JSON.parse(data) : [];
  },
  saveStudents: async (data: Student[]) => {
    await delay(300);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data));
  },
  getParts: async (): Promise<Part[]> => {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEYS.PARTS);
    return data ? JSON.parse(data) : [
      { id: 'T1', code: 'USI-001', name: 'Eixo de Transmissão', targetQuantity: 20 },
      { id: 'T2', code: 'USI-002', name: 'Bucha Cilíndrica', targetQuantity: 20 }
    ];
  },
  saveParts: async (data: Part[]) => {
    await delay(300);
    localStorage.setItem(STORAGE_KEYS.PARTS, JSON.stringify(data));
  },
  getTransactions: async (): Promise<Transaction[]> => {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },
  saveTransactions: async (data: Transaction[]) => {
    await delay(300);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data));
  },
  getWithdrawals: async (): Promise<StudentWithdrawal[]> => {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEYS.WITHDRAWALS);
    return data ? JSON.parse(data) : [];
  },
  saveWithdrawals: async (data: StudentWithdrawal[]) => {
    await delay(300);
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(data));
  }
};
