import { Part, Student, Transaction, StudentWithdrawal } from './types';
import { db_firestore } from './firebase'; 
import { doc, getDoc, setDoc } from 'firebase/firestore';

async function saveToFirebase(collectionName: string, data: any[]): Promise<void> {
  try {
    // Referência: documento 'items' dentro da coleção 'storage'
    const docRef = doc(db_firestore, 'storage', collectionName);
    await setDoc(docRef, { 
      items: data,
      lastUpdate: new Date().toISOString() 
    });
    console.log(`Sucesso ao salvar: ${collectionName}`);
  } catch (error) {
    console.error("Erro ao salvar no Firebase:", error);
  }
}

async function getFromFirebase<T>(collectionName: string, initialData: T[]): Promise<T[]> {
  try {
    const docRef = doc(db_firestore, 'storage', collectionName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return (docSnap.data().items as T[]) || initialData;
    }
    return initialData;
  } catch (error) {
    return initialData;
  }
}

export const db = {
  async getParts(): Promise<Part[]> { return getFromFirebase<Part>('parts', []); },
  async saveParts(parts: Part[]): Promise<void> { await saveToFirebase('parts', parts); },
  async getStudents(): Promise<Student[]> { return getFromFirebase<Student>('students', []); },
  async saveStudents(students: Student[]): Promise<void> { await saveToFirebase('students', students); },
  async getTransactions(): Promise<Transaction[]> { return getFromFirebase<Transaction>('transactions', []); },
  async saveTransactions(transactions: Transaction[]): Promise<void> { await saveToFirebase('transactions', transactions); },
  async getWithdrawals(): Promise<StudentWithdrawal[]> { return getFromFirebase<StudentWithdrawal>('withdrawals', []); },
  async saveWithdrawals(withdrawals: StudentWithdrawal[]): Promise<void> { await saveToFirebase('withdrawals', withdrawals); }
};
