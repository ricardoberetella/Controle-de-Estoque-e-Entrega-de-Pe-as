import { Part, Student, Transaction, StudentWithdrawal } from './types';
import { db_firestore } from './firebase'; 
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Função auxiliar única para salvar
async function saveToFirebase(collectionName: string, data: any[]) {
  try {
    console.log(`🚀 Tentando salvar ${collectionName}...`);
    await setDoc(doc(db_firestore, 'storage', collectionName), { 
      items: data,
      lastUpdate: new Date().toISOString() 
    });
    console.log(`✅ ${collectionName} salvo com sucesso!`);
  } catch (error) {
    console.error(`❌ Erro ao salvar ${collectionName}:`, error);
  }
}

// Função auxiliar única para buscar
async function getFromFirebase(collectionName: string, initialData: any[]) {
  try {
    const docRef = doc(db_firestore, 'storage', collectionName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().items;
    }
    return initialData;
  } catch (error) {
    console.error(`❌ Erro ao buscar ${collectionName}:`, error);
    return initialData;
  }
}

export const db = {
  async getParts() { return getFromFirebase('parts', []); },
  async saveParts(parts: Part[]) { await saveToFirebase('parts', parts); },
  
  async getStudents() { return getFromFirebase('students', []); },
  async saveStudents(students: Student[]) { await saveToFirebase('students', students); },
  
  async getTransactions() { return getFromFirebase('transactions', []); },
  async saveTransactions(transactions: Transaction[]) { await saveToFirebase('transactions', transactions); },
  
  async getWithdrawals() { return getFromFirebase('withdrawals', []); },
  async saveWithdrawals(withdrawals: StudentWithdrawal[]) { await saveToFirebase('withdrawals', withdrawals); }
};
