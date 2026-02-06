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
  Loader2,
  Search,
  UserPlus,
  Download,
  Settings,
  Lock,
  LogOut
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
import { generateId, formatDate, sortTaskIds, sortAlphabetically } from './utils';
import { db } from './dataService';

// --- Shared Components ---

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-300">
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-600 font-bold animate-pulse">Sincronizando com o banco de dados...</p>
    </div>
  </div>
);

// --- COMPONENTE DE LOGIN (ADICIONADO) ---
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === 'ianes662') {
      onLogin();
    } else {
      setError(true);
      setPass('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="bg-white p-10 rounded-[2rem] shadow-xl w-full max-w-sm text-center border-t-[6px] border-red-700">
        <h1 className="text-red-700 text-5xl font-black italic tracking-tighter mb-1">SENAI</h1>
        <p className="font-bold text-slate-800 text-sm leading-tight uppercase">Mecânico de Usinagem<br/>Convencional</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 mb-8">Planos de Demonstrações</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Senha de Acesso</label>
            <input 
              type="password" 
              value={pass}
              onChange={(e) => { setPass(e.target.value); setError(false); }}
              className={`w-full p-4 bg-slate-50 rounded-2xl border-2 text-center text-xl focus:outline-none ${error ? 'border-red-500' : 'border-transparent focus:border-red-600'}`}
              placeholder="••••••••"
              autoFocus
            />
          </div>
          <button type="submit" className="w-full py-4 bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-800 transition-all shadow-lg shadow-red-900/20">Acessar</button>
        </form>
      </div>
    </div>
  );
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-white animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
};

export default function App() {
  // Estado para controle do login
  const [isAuthorized, setIsAuthorized] = useState(() => localStorage.getItem('auth_muc') === 'true');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentWithdrawals, setStudentWithdrawals] = useState<StudentWithdrawal[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [t, s, sw, p] = await Promise.all([
          db.transactions.toArray(),
          db.students.toArray(),
          db.studentWithdrawals.toArray(),
          db.parts.toArray()
        ]);
        setTransactions(t);
        setStudents(s);
        setStudentWithdrawals(sw);
        setParts(p);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Se não estiver autorizado, mostra APENAS a tela de login
  if (!isAuthorized) {
    return <LoginScreen onLogin={() => { setIsAuthorized(true); localStorage.setItem('auth_muc', 'true'); }} />;
  }

  // Se estiver carregando os dados do banco, mostra o loading
  if (isLoading) return <LoadingOverlay />;

  const handleUpdateTransactions = async (newTransactions: Transaction[]) => {
    setIsSyncing(true);
    setTransactions(newTransactions);
    setIsSyncing(false);
  };

  const handleUpdateStudents = async (newStudents: Student[]) => {
    setIsSyncing(true);
    setStudents(newStudents);
    setIsSyncing(false);
  };

  const handleUpdateParts = async (newParts: Part[]) => {
    setIsSyncing(true);
    setParts(newParts);
    setIsSyncing(false);
  };

  return (
    <Router>
      {isSyncing && <LoadingOverlay />}
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
        {/* Sidebar */}
        <aside className="w-72 bg-slate-900 text-slate-400 flex flex-col shrink-0">
          <div className="p-8">
            <div className="flex flex-col">
              <span className="text-3xl font-black italic tracking-tighter text-white">SENAI</span>
              <span className="text-[10px] font-black tracking-[0.3em] text-red-600 uppercase">Estoque MUC</span>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <SidebarLink to="/stock" icon={<Package size={20} />} label="Estoque Central" />
            <SidebarLink to="/students" icon={<Users size={20} />} label="Alunos" />
            <SidebarLink to="/transactions" icon={<ArrowLeftRight size={20} />} label="Movimentação" />
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button 
              onClick={() => { setIsAuthorized(false); localStorage.removeItem('auth_muc'); }}
              className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black tracking-widest text-red-400 hover:bg-red-500/10 rounded-xl transition-all uppercase"
            >
              <LogOut size={16} /> Sair do Sistema
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative">
          <div className="p-8 max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={
                <DashboardView 
                  transactions={transactions} 
                  students={students} 
                  studentWithdrawals={studentWithdrawals}
                  parts={parts}
                />
              } />
              <Route path="/stock" element={
                <StockView 
                  transactions={transactions} 
                  studentWithdrawals={studentWithdrawals}
                  parts={parts}
                  onUpdate={handleUpdateTransactions}
                  onUpdateParts={handleUpdateParts}
                />
              } />
              <Route path="/students" element={
                <StudentsView 
                  students={students} 
                  onUpdate={handleUpdateStudents}
                />
              } />
              <Route path="/transactions" element={
                <TransactionsView 
                  transactions={transactions} 
                  onUpdate={handleUpdateTransactions}
                />
              } />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

// --- View Components (MANTIDOS ORIGINAIS) ---

function SidebarLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
        isActive 
          ? 'bg-red-600 text-white shadow-lg shadow-red-600/20 font-bold' 
          : 'hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-red-500'}`}>
        {icon}
      </span>
      <span className="text-sm tracking-wide uppercase font-bold">{label}</span>
    </Link>
  );
}

// NOTA: Cole abaixo desta linha todas as suas funções DashboardView, StockView, StudentsView, etc. 
// que já estavam no seu arquivo original. Elas não foram alteradas.

function DashboardView({ transactions, students, studentWithdrawals, parts }: { 
  transactions: Transaction[]; 
  students: Student[];
  studentWithdrawals: StudentWithdrawal[];
  parts: Part[];
}) {
  const stats = useMemo(() => {
    const entries = transactions.filter(t => t.type === TransactionType.ENTRY).reduce((acc, t) => acc + t.quantity, 0);
    const exits = transactions.filter(t => t.type === TransactionType.EXIT).reduce((acc, t) => acc + t.quantity, 0);
    return {
      totalItems: parts.length,
      totalStudents: students.length,
      stockMovement: entries + exits,
      lowStock: parts.filter(p => {
        const pEntries = transactions.filter(t => t.partId === p.id && t.type === TransactionType.ENTRY).reduce((acc, t) => acc + t.quantity, 0);
        const pExits = transactions.filter(t => t.partId === p.id && t.type === TransactionType.EXIT).reduce((acc, t) => acc + t.quantity, 0);
        return (pEntries - pExits) < (p.targetQuantity * 0.2);
      }).length
    };
  }, [transactions, students, parts]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Dashboard</h1>
        <p className="text-slate-500 font-medium">Visão geral do estoque e atividades</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total de Itens" value={stats.totalItems} icon={<Package className="text-blue-600" />} color="blue" />
        <StatCard title="Alunos Ativos" value={stats.totalStudents} icon={<Users className="text-purple-600" />} color="purple" />
        <StatCard title="Movimentações" value={stats.stockMovement} icon={<ArrowLeftRight className="text-amber-600" />} color="amber" />
        <StatCard title="Alerta de Estoque" value={stats.lowStock} icon={<TriangleAlert className="text-red-600" />} color="red" isAlert={stats.lowStock > 0} />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, isAlert }: any) {
  return (
    <div className={`bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 transition-all hover:shadow-md ${isAlert ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}>
      <div className={`p-4 rounded-2xl bg-${color}-50`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}

// ... (Continue colando aqui suas funções StockView, StudentsView e TransactionsView exatamente como estavam)
