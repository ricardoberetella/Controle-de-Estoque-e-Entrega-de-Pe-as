
import { Student, Part, Transaction, StudentWithdrawal } from './types';

const STORAGE_KEYS = {
  STUDENTS: 'usinagem_students',
  PARTS: 'usinagem_parts',
  TRANSACTIONS: 'usinagem_transactions',
  WITHDRAWALS: 'usinagem_withdrawals'
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const safeGet = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Erro ao ler ${key} do localStorage:`, e);
    return defaultValue;
  }
};

const safeSave = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`Dados salvos com sucesso em ${key}`);
  } catch (e) {
    console.error(`Erro ao salvar ${key} no localStorage:`, e);
    alert('Erro crítico: O navegador não conseguiu salvar os dados (espaço cheio ou permissão negada).');
  }
};

export const db = {
  getStudents: async (): Promise<Student[]> => {
    await delay(100);
    return safeGet(STORAGE_KEYS.STUDENTS, []);
  },
  saveStudents: async (data: Student[]) => {
    await delay(100);
    safeSave(STORAGE_KEYS.STUDENTS, data);
  },
  getParts: async (): Promise<Part[]> => {
    await delay(100);
    const defaults: Part[] = [
      { id: 'T1', code: 'USI-001', name: 'Eixo de Transmissão', targetQuantity: 20 },
      { id: 'T2', code: 'USI-002', name: 'Bucha Cilíndrica', targetQuantity: 20 }
    ];
    return safeGet(STORAGE_KEYS.PARTS, defaults);
  },
  saveParts: async (data: Part[]) => {
    await delay(100);
    safeSave(STORAGE_KEYS.PARTS, data);
  },
  getTransactions: async (): Promise<Transaction[]> => {
    await delay(100);
    return safeGet(STORAGE_KEYS.TRANSACTIONS, []);
  },
  saveTransactions: async (data: Transaction[]) => {
    await delay(100);
    safeSave(STORAGE_KEYS.TRANSACTIONS, data);
  },
  getWithdrawals: async (): Promise<StudentWithdrawal[]> => {
    await delay(100);
    return safeGet(STORAGE_KEYS.WITHDRAWALS, []);
  },
  saveWithdrawals: async (data: StudentWithdrawal[]) => {
    await delay(100);
    safeSave(STORAGE_KEYS.WITHDRAWALS, data);
  }
};
