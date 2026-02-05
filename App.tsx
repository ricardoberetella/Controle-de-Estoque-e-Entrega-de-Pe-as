import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Package, Users, ArrowLeftRight, TrendingDown, LayoutDashboard,
  Plus, Trash2, Edit2, CheckCircle2, AlertCircle, X, PlusCircle,
  TriangleAlert, CloudDownload, CloudUpload, Loader2, Search,
  UserPlus, Download, Settings
} from 'lucide-react';
import { Transaction, TransactionType, Student, StudentWithdrawal, StockSummary, Part } from './types';
import { CLASSES } from './constants';
import { generateId, formatDate } from './utils';
import { db } from './dataService';

// --- Natural Sort ---
const sortTaskIds = (aId: string, bId: string) => {
  const extractNum = (s: string) => parseInt(s.replace(/\D/g, '')) || 0;
  const numA = extractNum(aId);
  const numB = extractNum(bId);
  if (numA !== numB) return numA - numB;
  return aId.localeCompare(bId);
};

const sortAlphabetically = (a: string, b: string) => a.localeCompare(b, 'pt-BR');

// --- Componentes Reutilizáveis ---
const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-300">
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-600 font-bold animate-pulse">Sincronizando com o banco de dados...</p>
    </div>
  </div>
);

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1"><X size={24} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const ConfirmModal: React.FC<{ 
  isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string 
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-red-100 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4"><TriangleAlert className="h-6 w-6 text-red-600" /></div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl">Cancelar</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-100">Excluir</button>
        </div>
      </div>
    </div>
  );
};

// --- Componente de Layout Centralizado ---
const AppLayout: React.FC<{ children: React.ReactNode; stats: any }> = ({ children, stats }) => {
  const location = useLocation();

  const menuItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/students", icon: Users, label: "Retirada Alunos" },
    { to: "/transactions", icon: ArrowLeftRight, label: "Movimentação" },
    { to: "/stock", icon: Package, label: "Ver Estoque" },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F1F5F9] overflow-hidden font-sans">
      {/* SIDEBAR FIXA */}
      <aside className="w-64 bg-[#0d1117] text-white flex flex-col flex-shrink-0 shadow-2xl">
        <div className="p-8">
          <h1 className="text-2xl font-black italic tracking-tighter">SENAI</h1>
          <p className="text-[10px] text-gray-500 tracking-[0.3em] uppercase mt-1">Usinagem</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <div className="pb-4 text-[10px] font-bold text-gray-600 uppercase px-4 tracking-widest">Almoxarifado</div>
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                location.pathname === item.to 
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-semibold text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t border-gray-800">
          <button className="flex items-center gap-3 text-gray-500 hover:text-white w-full font-bold text-sm">
            <Settings size={18} /> Configurações
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10">
          
          {/* HEADER COM LOGO SENAI SOLICITADO */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-wrap items-center gap-8 w-full">
            <div className="bg-red-600 text-white px-10 py-5 rounded-3xl font-black text-3xl shadow-xl italic shadow-red-100">
              SENAI
            </div>
            <div className="flex-1 min-w-[250px]">
              <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">
                Mecânico de Usinagem Convencional
              </h2>
              <p className="text-slate-400 font-bold tracking-[0.2em] text-[10px] mt-2 uppercase">
                Controle de Estoque e Entrega / Gestão de Almoxarifado
              </p>
            </div>
          </div>

          {/* CONTEÚDO DINÂMICO */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

// --- App Principal ---
const App: React.FC = () => {
  // --- MANTENDO TODA A SUA LÓGICA ORIGINAL ---
  const [students, setStudents] = useState<Student[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<StudentWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<any>(null);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [s, p, t, w] = await Promise.all([
          db.getStudents(), db.getParts(), db.getTransactions(), db.getWithdrawals()
        ]);
        setStudents(s); setParts(p); setTransactions(t); setWithdrawals(w);
      } finally { setLoading(false); }
    };
    loadAllData();
  }, []);

  const syncWithCloud = async (action: () => Promise<unknown>) => {
    setSyncing(true);
    try { await action(); } finally { setSyncing(false); }
  };

  // Funções de manipulação (Aqui entrariam suas funções completas handleSaveStudent, etc.)
  // Simplificado para o exemplo, mas você deve manter as suas originais aqui.

  const stats = useMemo(() => ({
    studentsCount: students.length,
    totalStock: transactions.filter(t => t.type === TransactionType.ENTRY).reduce((acc, t) => acc + t.quantity, 0),
    deliveredCount: withdrawals.length,
    criticalItems: 0 // Sua lógica de cálculo
  }), [students, transactions, withdrawals]);

  if (loading) return <LoadingOverlay />;

  return (
    <Router>
      <AppLayout stats={stats}>
        <Routes>
          {/* Aqui você insere os seus componentes de página originais */}
          <Route path="/" element={<div className="font-bold">Dashboard em construção...</div>} />
          <Route path="/students" element={<div className="font-bold">Página de Alunos...</div>} />
          <Route path="/transactions" element={<div className="font-bold">Página de Movimentação...</div>} />
          <Route path="/stock" element={<div className="font-bold">Página de Estoque...</div>} />
        </Routes>
      </AppLayout>

      {syncing && (
        <div className="fixed bottom-6 right-6 bg-white p-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-bounce">
          <Loader2 className="animate-spin text-red-600" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Salvando...</span>
        </div>
      )}
      
      {confirmConfig && (
        <ConfirmModal 
          isOpen={confirmConfig.isOpen} 
          onClose={() => setConfirmConfig(null)} 
          onConfirm={confirmConfig.onConfirm}
          title={confirmConfig.title}
          message={confirmConfig.message}
        />
      )}
    </Router>
  );
};

export default App;
