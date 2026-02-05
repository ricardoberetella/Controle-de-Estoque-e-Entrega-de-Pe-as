import { db } from "./firebaseConfig";
import { doc, getDoc, updateDoc, setDoc, arrayUnion } from "firebase/firestore";

const COLLECTION = "storage";
const DOCUMENT = "parts";

export const dataService = {
  async salvarEntrada(dados: any) {
    try {
      const docRef = doc(db, COLLECTION, DOCUMENT);
      const docSnap = await getDoc(docRef);

      const novaPeca = {
        ...dados,
        id: Date.now(),
        data: new Date().toLocaleDateString('pt-BR')
      };

      if (docSnap.exists()) {
        // Se já existe, adiciona no array 'items'
        await updateDoc(docRef, {
          items: arrayUnion(novaPeca)
        });
      } else {
        // Se é a primeira vez, cria o documento e o array
        await setDoc(docRef, {
          items: [novaPeca]
        });
      }
      return true;
    } catch (error) {
      console.error("Erro ao salvar no banco:", error);
      throw error;
    }
  }
};
