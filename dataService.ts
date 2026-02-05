import { db } from "./firebaseConfig";
import { doc, getDoc, updateDoc, setDoc, arrayUnion } from "firebase/firestore";

// Nome da coleção e documento baseados na sua imagem
const COLLECTION_NAME = "storage";
const DOCUMENT_ID = "parts";

export const dataService = {
  // Função para salvar uma nova peça/item
  async addPart(newPart: any) {
    try {
      const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Se o documento existe, adiciona ao array 'items'
        await updateDoc(docRef, {
          items: arrayUnion(newPart)
        });
      } else {
        // Se o documento não existir, cria o primeiro
        await setDoc(docRef, {
          items: [newPart]
        });
      }
      return { success: true };
    } catch (error) {
      console.error("Erro ao salvar no Firestore:", error);
      throw error;
    }
  },

  // Função para buscar os dados em tempo real ou uma vez
  async getParts() {
    try {
      const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data().items : [];
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      return [];
    }
  }
};
