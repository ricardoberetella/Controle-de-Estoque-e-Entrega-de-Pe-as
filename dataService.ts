
import { Part, Student, Transaction, StudentWithdrawal } from './types';
import { INITIAL_PARTS, INITIAL_STUDENTS } from './constants';

// Simulação de latência de rede para testar UX de carregamento
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * DATABASE SERVICE
 * Atualmente simulando persistência local, mas estruturado para 
 * chamadas de API reais (fetch/axios) ou SDKs de Cloud (Firebase).
 */
export const db = {
  async getParts(): Promise<Part[]> {
    await delay(500);
    const data = localStorage.getItem('senai_parts');
    return data ? JSON.parse(data) : INITIAL_PARTS;
  },

  async saveParts(parts: Part[]): Promise<void> {
    await delay(300);
    localStorage.setItem('senai_parts', JSON.stringify(parts));
  },

  async getStudents(): Promise<Student[]> {
    await delay(600);
    const data = localStorage.getItem('senai_students');
    return data ? JSON.parse(data) : INITIAL_STUDENTS;
  },

  async saveStudents(students: Student[]): Promise<void> {
    await delay(300);
    localStorage.setItem('senai_students', JSON.stringify(students));
  },

  async getTransactions(): Promise<Transaction[]> {
    await delay(400);
    const data = localStorage.getItem('senai_transactions');
    return data ? JSON.parse(data) : [];
  },

  async saveTransactions(transactions: Transaction[]): Promise<void> {
    await delay(300);
    localStorage.setItem('senai_transactions', JSON.stringify(transactions));
  },

  async getWithdrawals(): Promise<StudentWithdrawal[]> {
    await delay(450);
    const data = localStorage.getItem('senai_withdrawals');
    return data ? JSON.parse(data) : [];
  },

  async saveWithdrawals(withdrawals: StudentWithdrawal[]): Promise<void> {
    await delay(300);
    localStorage.setItem('senai_withdrawals', JSON.stringify(withdrawals));
  }
};
