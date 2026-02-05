import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Package, 
  Users, 
  ArrowLeftRight, 
  TrendingDown, 
  LayoutDashboard,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  PlusCircle,
  TriangleAlert,
  CloudDownload,
  CloudUpload,
  Loader2,
  Search,
  UserPlus,
  Download,
  Settings
} from 'lucide-react';
import { 
  Transaction, 
  TransactionType, 
  Student, 
  StudentWithdrawal, 
  StockSummary,
  Part
} from './types';
import { CLASSES } from './constants';
import { generateId, formatDate } from './utils';
import { db } from './dataService';

// --- Natural Sort e Helpers ---
const sortTaskIds = (aId: string, bId: string) => {
  const extractNum = (s: string) => parseInt(s.replace(/\D/g, '')) || 0;
  const numA = extractNum(aId);
  const numB = extractNum(bId);
  if (numA !== numB) return numA - numB;
  return aId.localeCompare(bId);
};

const sortAlphabetically = (a: string, b: string) => a.localeCompare(b, 'pt-BR');

// --- Overlay de Carregamento ---
const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[9999] flex items-center justify-center flex-col gap-4">
    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
    <p className="text-blue-900 font-black tracking-widest uppercase text-xs">Sincronizando com Firebase...</p>
  </div>
);

export default function App() {
  const [parts, setParts] = useState<Part[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<StudentWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  // --- CARREGAMENTO INICIAL (FIREBASE) ---
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        // Busca todos os dados em paralelo do Realtime Database
        const [p, s, t, w] = await Promise.all([
          db.getParts(),
          db.getStudents(),
          db.getTransactions(),
          db.getWithdrawals()
        ]);
        
        setParts(p || []);
        setStudents(s || []);
        setTransactions(t || []);
        setWithdrawals(w || []);
      } catch (err) {
        console.error("Erro crítico ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // --- FUNÇÕES DE PERSISTÊNCIA (FIREBASE) ---
  // Substituímos os setters locais por funções que salvam na nuvem e atualizam o estado

  const updateParts = async (newParts: Part[]) => {
    setParts(newParts);
    await db.saveParts(newParts);
  };

  const updateStudents = async (newStudents: Student[]) => {
    setStudents(newStudents);
    await db.saveStudents(newStudents);
  };

  const updateTransactions = async (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    await db.saveTransactions(newTransactions);
  };

  const updateWithdrawals = async (newWithdrawals: StudentWithdrawal[]) => {
    setWithdrawals(newWithdrawals);
    await db.saveWithdrawals(newWithdrawals);
  };

  if (loading) return <LoadingOverlay />;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Aqui entra a estrutura de Navegação e as Rotas que você já tinha */}
        {/* Certifique-se de que os componentes Inventory, Students, etc., usem as funções updateX acima */}
        <div className="p-8">O sistema está pronto e conectado!</div>
      </div>
    </Router>
  );
}
