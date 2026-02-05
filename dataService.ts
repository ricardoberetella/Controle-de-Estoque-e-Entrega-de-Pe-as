import { Part, Student, Transaction, StudentWithdrawal } from './types';
import { db_firestore } from './firebase'; 
import { doc, getDoc, setDoc } from 'firebase/firestore';

async function saveToFirebase(collectionName: string, data: any[]): Promise<void> {
  try {
    const docRef = doc(db_firestore, 'storage', collectionName);
    await setDoc(docRef, { 
      items: data,
      lastUpdate: new Date().toISOString() 
    });
  } catch (error) {
    console.error(`Erro ao salvar ${collectionName}:`, error);
  }
}

async function getFromFirebase(collectionName: string, initialData: any[]): Promise<any[]> {
  try {
    const docRef = doc(db_firestore, 'storage', collectionName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().items || initialData;
    }
    return initialData;
  } catch (error) {
    return initialData;
  }
}

export const db = {
  async getParts(): Promise<Part[]> { 
    const data = await getFromFirebase('parts', []);
    return data as Part[];
  },
  async saveParts(parts: Part[]): Promise<void> { 
    await saveToFirebase('parts', parts); 
  },
  async getStudents(): Promise<Student[]> { 
    const data = await getFromFirebase('students', []);
    return data as Student[];
  },
  async saveStudents(students: Student[]): Promise<void> { 
    await saveToFirebase('students', students); 
  },
  async getTransactions(): Promise<Transaction[]> { 
    const data = await getFromFirebase('transactions', []);
    return data as Transaction[];
  },
  async saveTransactions(transactions: Transaction[]): Promise<void> { 
    await saveToFirebase('transactions', transactions); 
  },
  async getWithdrawals(): Promise<StudentWithdrawal[]> { 
    const data = await getFromFirebase('withdrawals', []);
    return data as StudentWithdrawal[];
  },
  async saveWithdrawals(withdrawals: StudentWithdrawal[]): Promise<void> { 
    await saveToFirebase('withdrawals', withdrawals); 
  }
};
