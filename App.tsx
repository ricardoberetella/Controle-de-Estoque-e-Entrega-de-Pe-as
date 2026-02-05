import React, { useState, useEffect, useMemo } from 'react';
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

/* ===============================
   UTIL
================================ */
const sortTaskIds = (aId: string, bId: string) => {
  const extractNum = (s: string) => parseInt(s.replace(/\D/g, '')) || 0;
  const numA = extractNum(aId);
  const numB = extractNum(bId);
  if (numA !== numB) return numA - numB;
  return aId.localeCompare(bId);
};

const sortAlphabetically = (a: string, b: string) =>
  a.localeCompare(b, 'pt-BR');

/* ===============================
   COMPONENTES BASE
================================ */
const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex items-center justify-center">
    <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
  </div>
);

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="font-black">{title}</h3>
          <button onClick={onClose}><X /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const ConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
        <TriangleAlert className="mx-auto mb-3 text-red-600" />
        <h3 className="font-black">{title}</h3>
        <p className="text-sm text-gray-500 my-4">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-100 rounded-xl py-2 font-bold">
            Cancelar
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 bg-red-600 text-white rounded-xl py-2 font-bold"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

/* ===============================
   APP
================================ */
const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<StudentWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [confirm, setConfirm] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [s, p, t, w] = await Promise.all([
        db.getStudents(),
        db.getParts(),
        db.getTransactions(),
        db.getWithdrawals()
      ]);
      setStudents(s);
      setParts(p);
      setTransactions(t);
      setWithdrawals(w);
      setLoading(false);
    };
    load();
  }, []);

  const sync = async (fn: () => Promise<any>) => {
    setSyncing(true);
    await fn();
    setSyncing(false);
  };

  const stockSummary = useMemo(() => {
    return parts.map(part => {
      const entries = transactions.filter(t => t.partId === part.id && t.type === TransactionType.ENTRY).reduce((s, t) => s + t.quantity, 0);
      const exits = transactions.filter(t => t.partId === part.id && t.type === TransactionType.EXIT).reduce((s, t) => s + t.quantity, 0);
      const studentExits = withdrawals.filter(w => w.partId === part.id).length;
      const balance = entries - exits - studentExits;
      return {
        partId: part.id,
        code: part.code,
        entries,
        exits,
        studentExits,
        balance,
        situation: balance >= part.targetQuantity ? 'OK' : 'COMPRAR',
        toBuy: Math.max(0, part.targetQuantity - balance)
      } as StockSummary;
    });
  }, [parts, transactions, withdrawals]);

  if (loading) return <LoadingOverlay />;

  return (
    <Router>
      <div className="min-h-screen flex bg-slate-50">

        {/* SIDEBAR */}
        <aside className="hidden md:flex w-64 bg-gray-900 text-white flex-col">
          <div className="p-6 border-b border-gray-800 flex justify-between">
            <div>
              <div className="bg-red-600 h-1.5 w-10 mb-3 rounded-full" />
              <div className="font-black italic text-xl">SENAI</div>
              <div className="text-xs text-gray-400 tracking-widest">USINAGEM</div>
            </div>
            {syncing
              ? <Loader2 className="animate-spin text-blue-400" />
              : <CloudDownload className="text-green-500" />
            }
          </div>

          <nav className="p-4 space-y-2">
            <NavItem to="/" icon={<LayoutDashboard />} label="Início" />
            <NavItem to="/withdrawals" icon={<Users />} label="Retirada Alunos" />
            <NavItem to="/transactions" icon={<ArrowLeftRight />} label="Movimentação" />
            <NavItem to="/stock" icon={<Package />} label="Estoque" />
            <NavItem to="/planning" icon={<TrendingDown />} label="Planejamento" />
            <NavItem to="/parts" icon={<Settings />} label="Peças" />
            <NavItem to="/students" icon={<UserPlus />} label="Alunos" />
          </nav>
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Dashboard summary={stockSummary} students={students} />} />
          </Routes>
        </main>

        <ConfirmModal
          isOpen={!!confirm}
          title={confirm?.title}
          message={confirm?.message}
          onClose={() => setConfirm(null)}
          onConfirm={confirm?.onConfirm}
        />
      </div>
    </Router>
  );
};

/* ===============================
   NAV
================================ */
const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 p-3 rounded-xl font-bold ${
        active ? 'bg-red-600' : 'text-gray-400 hover:bg-gray-800'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
};

/* ===============================
   DASHBOARD (LOGO REMOVIDO)
================================ */
const Dashboard: React.FC<{ summary: StockSummary[]; students: Student[] }> = ({ summary, students }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-8 shadow">
        <div className="bg-red-600 text-white rounded-2xl p-6 inline-block font-black text-xl uppercase">
          SENAI
        </div>
        <h2 className="mt-6 font-black text-3xl italic">
          Mecânico de Usinagem Convencional
        </h2>
        <p className="text-gray-500 font-bold">
          Controle de Estoque e Entrega de Peças
        </p>
      </div>
    </div>
  );
};

export default App;
