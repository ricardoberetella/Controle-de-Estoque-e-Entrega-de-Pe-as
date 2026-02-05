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

// --- Componente de Carregamento ---
const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex items-center justify-center flex-col gap-4">
    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
    <p className="text-blue-900 font-black tracking-widest uppercase text-xs">Conectando ao Firebase...</p>
  </div>
);

export default function App() {
  const [parts, setParts] = useState<Part[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<StudentWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados iniciais do Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [p, s, t, w] = await Promise.all([
          db.getParts(),
          db.getStudents(),
          db.getTransactions(),
          db.getWithdrawals()
        ]);
        setParts(p);
        setStudents(s);
        setTransactions(t);
        setWithdrawals(w);
      } catch (error) {
        console.error("Erro ao carregar dados do Firebase:", error);
        alert("Erro de conexão com o banco de dados. Verifique as regras de segurança.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Sincronizar Peças
  const saveParts = async (newParts: Part[]) => {
    setParts(newParts);
    await db.saveParts(newParts);
  };

  // Sincronizar Estudantes
  const saveStudents = async (newStudents: Student[]) => {
    setStudents(newStudents);
    await db.saveStudents(newStudents);
  };

  // Sincronizar Transações
  const saveTransactions = async (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    await db.saveTransactions(newTransactions);
  };

  // Sincronizar Retiradas
  const saveWithdrawals = async (newWithdrawals: StudentWithdrawal[]) => {
    setWithdrawals(newWithdrawals);
    await db.saveWithdrawals(newWithdrawals);
  };

  if (loading) return <LoadingOverlay />;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        {/* O restante do seu layout de rotas e componentes permanece aqui conforme o original */}
        <nav className="w-64 bg-white border-r flex flex-col">
           {/* ... conteúdo do menu ... */}
        </nav>
        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<Dashboard parts={parts} transactions={transactions} />} />
            {/* Outras rotas passando os setters criados acima */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Nota: Os subcomponentes (Dashboard, Inventory, etc) devem usar os hooks de save criados acima.
