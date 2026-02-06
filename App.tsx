import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
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
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Senha de Acesso</label>
            <input 
              type="password" 
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className={`w-full p-4 bg-slate-50 rounded-2xl border-2 text-center text-xl focus:outline-none ${error ? 'border-red-500' : 'border-transparent focus:border-red-600'}`}
              placeholder="••••••••"
              autoFocus
            />
          </div>
          <button type="submit" className="w-full py-4 bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-800 transition-all shadow-lg">Entrar</button>
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
  // Estado de autenticação adicionado
  const [isAuthorized, setIsAuthorized] = useState(() => localStorage.getItem('auth') === 'true');
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentWithdrawals, setStudentWithdrawals] = useState<StudentWithdrawal[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // --- Efeito para carregar dados (Original) ---
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
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (!isAuthorized) {
    return <LoginScreen onLogin={() => { setIsAuthorized(true); localStorage.setItem('auth', 'true'); }} />;
  }

  if (isLoading) return <LoadingOverlay />;

  // MANTIVE TODO O SEU CONTEÚDO ORIGINAL ABAIXO (Views, Handlers, etc)
  // ... (O restante do seu código App.tsx segue exatamente igual aqui)
  
  return (
    <Router>
      {isSyncing && <LoadingOverlay />}
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
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
              onClick={() => { setIsAuthorized(false); localStorage.removeItem('auth'); }}
              className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
            >
              <LogOut size={16} /> SAIR
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto relative">
          <div className="p-8 max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<DashboardView transactions={transactions} students={students} studentWithdrawals={studentWithdrawals} parts={parts} />} />
              <Route path="/stock" element={<StockView transactions={transactions} studentWithdrawals={studentWithdrawals} parts={parts} onUpdate={setTransactions} onUpdateParts={setParts} />} />
              <Route path="/students" element={<StudentsView students={students} onUpdate={setStudents} />} />
              <Route path="/transactions" element={<TransactionsView transactions={transactions} onUpdate={setTransactions} />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

// SidebarLink e outras sub-funções suas continuam abaixo...
function SidebarLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${isActive ? 'bg-red-600 text-white shadow-lg shadow-red-600/20 font-bold' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
      <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-red-500'}`}>{icon}</span>
      <span className="text-sm tracking-wide uppercase font-bold">{label}</span>
    </Link>
  );
}
