import { Part, Student, Transaction, StudentWithdrawal } from './types';
import { db_firestore } from './firebase'; 
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Função auxiliar única para salvar no Firestore
async function saveToFirebase(collectionName: string, data: any[]) {
  try {
    console.log(`🚀 Tentando salvar ${collectionName}...`);
    // Salvamos tudo dentro de um documento chamado 'storage' para facilitar
    await setDoc(doc(db_firestore, 'storage', collectionName), { 
      items: data,
      lastUpdate: new Date().toISOString() 
    });
    console.log(`✅ ${collectionName} salvo com sucesso no Firebase!`);
  } catch (error) {
    console.error(`❌ Erro ao salvar ${collectionName}:`, error);
  }
}

// Função auxiliar única para buscar do Firestore
async function getFromFirebase(collectionName: string, initialData: any[]) {
  try {
    const docRef = doc(db_firestore, 'storage', collectionName);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log(`📦 Dados de ${collectionName} recuperados do Firebase.`);
      return docSnap.data().items;
    }
    
    console.log(`ℹ️ Nenhuns dados encontrados para ${collectionName}, usando padrão.`);
    return initialData;
  } catch (error) {
    console.error(`❌ Erro ao buscar ${collectionName}:`, error);
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
