import { Part, Student, Transaction, StudentWithdrawal } from './types';
import { db_firestore } from './firebase'; 
import { doc, getDoc, setDoc } from 'firebase/firestore';

async function saveToFirebase(collectionName: string, data: any[]): Promise<void> {
  try {
    await setDoc(doc(db_firestore, 'storage', collectionName), { 
      items: data,
      lastUpdate: new Date().toISOString() 
    });
  } catch (error) {
    console.error(`Erro ao salvar ${collectionName}:`, error);
  }
}

async function getFromFirebase<T>(collectionName: string, initialData: T[]): Promise<T[]> {
  try {
    const docRef = doc(db_firestore, 'storage', collectionName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data()?.items) {
      return docSnap.data().items as T[];
    }
    return initialData;
  } catch (error) {
    console.error(`Erro ao buscar ${collectionName}:`, error);
    return initialData;
  }
}

export const db = {
  async getParts(): Promise<Part[]> { 
    return getFromFirebase<Part>('parts', []); 
  },
  async saveParts(parts: Part[]): Promise<void> { 
    await saveToFirebase('parts', parts); 
  },
  async getStudents(): Promise<Student[]> { 
    return getFromFirebase<Student>('students', []); 
  },
  async saveStudents(students: Student[]): Promise<void> { 
    await saveToFirebase('students', students); 
  },
  async getTransactions(): Promise<Transaction[]> { 
    return getFromFirebase<Transaction>('transactions', []); 
  },
  async saveTransactions(transactions: Transaction[]): Promise<void> { 
    await saveToFirebase('transactions', transactions); 
  },
  async getWithdrawals(): Promise<StudentWithdrawal[]> { 
    return getFromFirebase<StudentWithdrawal>('withdrawals', []); 
  },
  async saveWithdrawals(withdrawals: StudentWithdrawal[]): Promise<void> { 
    await saveToFirebase('withdrawals', withdrawals); 
  }
};
