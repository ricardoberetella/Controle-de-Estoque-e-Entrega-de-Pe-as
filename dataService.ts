import { Part, Student, Transaction, StudentWithdrawal } from './types';
import { db_firestore } from './firebase'; // Importando a conexão que você criou
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Função auxiliar para salvar no Google
async function saveToFirebase(collectionName: string, data: any[]) {
  try {
    await setDoc(doc(db_firestore, 'storage', collectionName), { items: data });
  } catch (error) {
    console.error("Erro ao salvar no Firebase:", error);
  }
}

// Função auxiliar para buscar do Google
async function getFromFirebase(collectionName: string, initialData: any[]) {
  try {
    const docRef = doc(db_firestore, 'storage', collectionName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().items;
    }
    return initialData;
  } catch (error) {
    console.error("Erro ao buscar do Firebase:", error);
    return initialData;
  }
}

export const db = {
  async getParts(): Promise<Part[]> {
    return getFromFirebase('parts', []);
  },
  async saveParts(parts: Part[]): Promise<void> {
    await saveToFirebase('parts', parts);
  },
  async getStudents(): Promise<Student[]> {
    return getFromFirebase('students', []);
  },
  async saveStudents(students: Student[]): Promise<void> {
    await saveToFirebase('students', students);
  },
  async getTransactions(): Promise<Transaction[]> {
    return getFromFirebase('transactions', []);
  },
  async saveTransactions(transactions: Transaction[]): Promise<void> {
    await saveToFirebase('transactions', transactions);
  },
  async getWithdrawals(): Promise<StudentWithdrawal[]> {
    return getFromFirebase('withdrawals', []);
  },
  async saveWithdrawals(withdrawals: StudentWithdrawal[]): Promise<void> {
    await saveToFirebase('withdrawals', withdrawals);
  }
};
async function saveToFirebase(collectionName: string, data: any[]) {
  try {
    console.log(`Tentando salvar ${collectionName}:`, data); // <-- Adicione esta linha
    await setDoc(doc(db_firestore, 'storage', collectionName), { items: data });
    console.log("Salvo com sucesso!"); // <-- Adicione esta linha
  } catch (error) {
    console.error("Erro ao salvar no Firebase:", error);
  }
}
