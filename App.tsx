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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-red-100 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4"><TriangleAlert className="h-6 w-6 text-red-600" /></div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl">Cancelar</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-100">Confirmar</button>
        </div>
      </div>
    </div>
  );
};

// --- Login Screen (APENAS ADIÇÃO, NÃO ALTERA O RESTO DO SISTEMA) ---

const SENHA_FIXA = "ianes662";

const LoginScreen: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const seeSENAILogo = (
    <div className="flex items-center justify-center">
      <svg width="240" height="70" viewBox="0 0 350 90" xmlns="http://www.w3.org/2000/svg" aria-label="SENAI">
        <rect x="0" y="0" width="350" height="90" fill="#E30613" />
        <g fill="#FFFFFF">
          <rect x="8" y="15" width="22" height="5" />
          <rect x="8" y="30" width="22" height="5" />
          <rect x="8" y="45" width="22" height="5" />
          <rect x="8" y="60" width="22" height="5" />
          <rect x="8" y="75" width="22" height="5" />
          <rect x="320" y="15" width="22" height="5" />
          <rect x="320" y="30" width="22" height="5" />
          <rect x="320" y="45" width="22" height="5" />
          <rect x="320" y="60" width="22" height="5" />
          <rect x="320" y="75" width="22" height="5" />
        </g>
        <text
          x="175"
          y="52"
          fill="#FFFFFF"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: '72px' }}
        >
          SENAI
        </text>
      </svg>
    </div>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (senha.trim() === SENHA_FIXA) {
      try { sessionStorage.setItem("muc_auth", "1"); } catch { /* ignore */ }
      onSuccess();
      return;
    }

    setErro("Senha inválida.");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="w-full max-w-[520px] bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/70 border border-gray-100 overflow-hidden">
        <div className="h-2 bg-red-600" />

        <div className="p-10 text-center">
          {seeSENAILogo}

          <div className="mt-7 space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
              Mecânico de Usinagem
            </h2>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
              Convencional
            </h2>
            <p className="text-sm md:text-base font-black text-gray-500 uppercase tracking-widest mt-3">
              Controle de Estoque e Entrega de Peças
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-4">
            <div className="text-left">
              <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">
                Senha de acesso
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => { setSenha(e.target.value); if (erro) setErro(null); }}
                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 outline-none focus:bg-white focus:border-red-500 transition-all font-bold tracking-widest text-center"
                placeholder="••••••"
                autoFocus
              />
              {erro && <p className="mt-2 text-xs font-bold text-red-600">{erro}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 transition-colors text-white font-black py-4 rounded-2xl shadow-lg shadow-red-100 uppercase tracking-[0.35em]"
            >
              SENHA
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  // ✅ login simples (não mexe no resto). Libera o sistema somente após senha correta.
  const [authed, setAuthed] = useState<boolean>(() => {
    try { return sessionStorage.getItem("muc_auth") === "1"; } catch { return false; }
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<StudentWithdrawal[]>([]);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; onConfirm: () => void; title: string; message: string } | null>(null);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
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
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  const sortedStudents = useMemo(() =>
    [...students].sort((a, b) => sortAlphabetically(a.name, b.name)),
    [students]
  );

  const sortedParts = useMemo(() =>
    [...parts].sort((a, b) => sortTaskIds(a.id, b.id)),
    [parts]
  );

  const syncWithCloud = async (action: () => Promise<unknown>) => {
    setSyncing(true);
    try {
      await action();
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveStudent = async (s: Omit<Student, 'id'>, id?: string) => {
    const studentToSave = id
      ? { ...students.find(st => st.id === id), ...s } as Student
      : { id: generateId(), ...s } as Student;

    const updated = id
      ? students.map(st => st.id === id ? studentToSave : st)
      : [...students, studentToSave];

    setStudents(updated);
    await syncWithCloud(() => db.saveStudent(studentToSave));
  };

  const handleDeleteStudent = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Remover Aluno",
      message: "Deseja excluir este aluno permanentemente do banco de dados?",
      onConfirm: async () => {
        setStudents(prev => prev.filter(s => s.id !== id));
        await syncWithCloud(() => db.deleteStudent(id));
      }
    });
  };

  const handleSavePart = async (p: Part, isEditing: boolean) => {
    const updated = isEditing ? parts.map(part => part.id === p.id ? { ...p } : part) : [...parts, { ...p }];
    setParts(updated);
    await syncWithCloud(() => db.savePart(p));
  };

  const handleDeletePart = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Excluir Tarefa",
      message: `Remover a ${id} e todas as suas retiradas permanentemente?`,
      onConfirm: async () => {
        const associatedWithdrawals = withdrawals.filter(w => w.partId === id);
        setParts(prev => prev.filter(p => p.id !== id));
        setWithdrawals(prev => prev.filter(w => w.partId !== id));
        await syncWithCloud(() => db.deletePart(id, associatedWithdrawals));
      }
    });
  };

  const handleSaveTransaction = async (t: Omit<Transaction, 'id'>, id?: string) => {
    const transactionToSave = id
      ? { ...transactions.find(tr => tr.id === id), ...t } as Transaction
      : { ...t, id: generateId() } as Transaction;

    const updated = id
      ? transactions.map(trans => trans.id === id ? transactionToSave : trans)
      : [...transactions, transactionToSave];

    setTransactions(updated);
    await syncWithCloud(() => db.saveTransaction(transactionToSave));
  };

  const handleDeleteTransaction = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Estornar Lançamento",
      message: "Remover este registro permanentemente do banco de dados?",
      onConfirm: async () => {
        setTransactions(prev => prev.filter(t => t.id !== id));
        await syncWithCloud(() => db.deleteTransaction(id));
      }
    });
  };

  const toggleWithdrawal = async (studentId: string, partId: string) => {
    const existing = withdrawals.find(w => w.studentId === studentId && w.partId === partId);

    if (existing) {
      setWithdrawals(prev => prev.filter(w => w !== existing));
      await syncWithCloud(() => db.deleteWithdrawal(studentId, partId));
    } else {
      const newWithdrawal = { studentId, partId, date: new Date().toISOString() };
      setWithdrawals(prev => [...prev, newWithdrawal]);
      await syncWithCloud(() => db.saveWithdrawal(newWithdrawal));
    }
  };

  const stockSummary = useMemo(() => {
    return sortedParts.map(part => {
      const entries = transactions.filter(t => t.partId === part.id && t.type === TransactionType.ENTRY).reduce((sum, t) => sum + t.quantity, 0);
      const exits = transactions.filter(t => t.partId === part.id && t.type === TransactionType.EXIT).reduce((sum, t) => sum + t.quantity, 0);
      const studentExits = withdrawals.filter(w => w.partId === part.id).length;
      const balance = entries - exits - studentExits;

      const totalStudents = students.length;
      const studentsWaiting = Math.max(0, totalStudents - studentExits);
      const toBuy = Math.max(0, studentsWaiting - balance);

      return {
        partId: part.id,
        code: part.code,
        entries,
        exits,
        studentExits,
        balance,
        situation: toBuy === 0 ? 'OK' : 'COMPRAR',
        toBuy
      } as StockSummary;
    });
  }, [transactions, withdrawals, sortedParts, students.length]);

  if (loading) return <LoadingOverlay />;

  // ✅ trava o sistema até digitar a senha
  if (!authed) {
    return <LoginScreen onSuccess={() => setAuthed(true)} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-gray-900 h-screen sticky top-0 shadow-2xl z-50">
          <div className="p-8 border-b border-gray-800 bg-gray-950 flex justify-center items-center">
            <h1 className="text-white font-black text-2xl tracking-tighter italic leading-none text-center">
              SENAI<br />
              <span className="text-gray-400 font-medium text-[10px] tracking-[0.2em] uppercase not-italic">MUC</span>
            </h1>
          </div>
          <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
            <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Início" />
            <div className="px-3 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Almoxarifado</div>
            <NavItem to="/withdrawals" icon={<Users size={20} />} label="Retirada Alunos" />
            <NavItem to="/transactions" icon={<ArrowLeftRight size={20} />} label="Movimentação" />
            <NavItem to="/stock" icon={<Package size={20} />} label="Ver Estoque" />
            <NavItem to="/planning" icon={<TrendingDown size={20} />} label="Planejamento" />
            <div className="px-3 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Configuração</div>
            <NavItem to="/parts" icon={<Settings size={20} />} label="Peças / Tarefas" />
            <NavItem to="/students" icon={<UserPlus size={20} />} label="Alunos / Turmas" />
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-10 pb-24 min-w-0">
          {syncing && <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold z-[200] animate-bounce">Sincronizando...</div>}
          <Routes>
            <Route path="/" element={<Dashboard summary={stockSummary} students={sortedStudents} />} />
            <Route path="/withdrawals" element={<MaterialWithdrawals withdrawals={withdrawals} toggleWithdrawal={toggleWithdrawal} students={sortedStudents} parts={sortedParts} summary={stockSummary} />} />
            <Route path="/transactions" element={<Transactions transactions={transactions} saveTransaction={handleSaveTransaction} deleteTransaction={handleDeleteTransaction} parts={sortedParts} />} />
            <Route path="/stock" element={<StockInventory summary={stockSummary} />} />
            <Route path="/planning" element={<Planning summary={stockSummary} />} />
            <Route path="/parts" element={<PartsManager parts={sortedParts} onSave={handleSavePart} onDelete={handleDeletePart} />} />
            <Route path="/students" element={<StudentsManager students={sortedStudents} onSave={handleSaveStudent} onDelete={handleDeleteStudent} />} />
          </Routes>
        </main>

        <ConfirmModal
          isOpen={!!confirmConfig?.isOpen}
          onClose={() => setConfirmConfig(null)}
          onConfirm={confirmConfig?.onConfirm || (() => { })}
          title={confirmConfig?.title || ""}
          message={confirmConfig?.message || ""}
        />

        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 z-[100] shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
          <MobileNavItem to="/" icon={<LayoutDashboard size={20} />} />
          <MobileNavItem to="/withdrawals" icon={<Users size={20} />} />
          <MobileNavItem to="/transactions" icon={<ArrowLeftRight size={20} />} />
          <MobileNavItem to="/stock" icon={<Package size={20} />} />
        </nav>
      </div>
    </Router>
  );
};

// --- Shared Helper Components ---

const NavItem: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (<Link to={to} className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${active ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>{icon}<span className="font-bold text-sm">{label}</span></Link>);
};

const MobileNavItem: React.FC<{ to: string, icon: React.ReactNode }> = ({ to, icon }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (<Link to={to} className={`p-3 rounded-2xl ${active ? 'bg-red-50 text-red-600' : 'text-gray-400'}`}>{icon}</Link>);
};

const Dashboard: React.FC<{ summary: StockSummary[], students: Student[] }> = ({ summary, students }) => {
  const itemsCriticos = summary.filter(s => s.toBuy > 0).length;
  const totalEntregas = summary.reduce((acc, curr) => acc + curr.studentExits, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ✅ BOTÃO SAIR (ÚNICA ADIÇÃO) */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            try { sessionStorage.removeItem("muc_auth"); } catch { }
            window.location.reload();
          }}
          className="px-5 py-2.5 rounded-2xl bg-gray-900 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-gray-200 hover:bg-black transition-colors"
        >
          SAIR
        </button>
      </div>

      <header className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center gap-6 text-center">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center transition-transform hover:scale-105">
            <svg width="240" height="70" viewBox="0 0 350 90" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="350" height="90" fill="#E30613" />
              <g fill="#FFFFFF">
                <rect x="8" y="15" width="22" height="5" />
                <rect x="8" y="30" width="22" height="5" />
                <rect x="8" y="45" width="22" height="5" />
                <rect x="8" y="60" width="22" height="5" />
                <rect x="8" y="75" width="22" height="5" />
                <rect x="320" y="15" width="22" height="5" />
                <rect x="320" y="30" width="22" height="5" />
                <rect x="320" y="45" width="22" height="5" />
                <rect x="320" y="60" width="22" height="5" />
                <rect x="320" y="75" width="22" height="5" />
              </g>
              <text
                x="175"
                y="52"
                fill="#FFFFFF"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: '72px' }}
              >
                SENAI
              </text>
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-[0.95] uppercase italic tracking-tighter">
              Mecânico de Usinagem
            </h2>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight uppercase italic tracking-tighter">
              Convencional
            </h2>
            <p className="text-lg md:text-xl font-bold text-gray-500 uppercase tracking-tight mt-4">
              Controle de Estoque e Entrega de Peças
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-5 transition-all hover:shadow-md">
          <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100"><Users size={28} /></div>
          <div><p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Alunos</p><p className="text-3xl font-black text-gray-900">{students.length}</p></div>
        </div>
        <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-5 transition-all hover:shadow-md">
          <div className="p-4 rounded-2xl bg-green-50 text-green-600 border border-green-100"><Package size={28} /></div>
          <div><p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Estoque</p><p className="text-3xl font-black text-gray-900">{summary.reduce((acc, curr) => acc + curr.balance, 0)}</p></div>
        </div>
        <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-5 transition-all hover:shadow-md">
          <div className="p-4 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100"><CheckCircle2 size={28} /></div>
          <div><p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Entregues</p><p className="text-3xl font-black text-gray-900">{totalEntregas}</p></div>
        </div>
        <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-5 transition-all hover:shadow-md">
          <div className="p-4 rounded-2xl bg-red-50 text-red-600 border border-red-100"><AlertCircle size={28} /></div>
          <div><p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Críticos</p><p className="text-3xl font-black text-gray-900">{itemsCriticos}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-gray-800 flex items-center gap-2 uppercase italic tracking-tighter"><TrendingDown size={22} className="text-orange-500" /> Alertas de Reposição</h3>
            <Link to="/planning" className="text-xs font-black text-gray-400 hover:text-red-600 uppercase tracking-widest transition-colors">Ver tudo</Link>
          </div>
          <div className="space-y-4">
            {summary.filter(s => s.toBuy > 0).slice(0, 5).map(item => (
              <div key={item.partId} className="flex justify-between items-center p-4 bg-gray-50 hover:bg-red-50/50 rounded-2xl border border-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center bg-white rounded-xl font-black text-red-600 border border-red-100">{item.partId}</div>
                  <div><p className="font-bold text-gray-700 leading-tight">Peça {item.partId}</p><p className="text-xs text-gray-400 font-medium">Cód: {item.code}</p></div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-red-600 uppercase tracking-tighter">Falta</p>
                  <p className="text-xl font-black text-red-600 leading-none">{item.toBuy}</p>
                </div>
              </div>
            ))}
            {summary.filter(s => s.toBuy > 0).length === 0 && (
              <div className="p-10 text-center space-y-2 opacity-50">
                <CheckCircle2 size={40} className="mx-auto text-green-500" />
                <p className="font-bold text-gray-400 uppercase tracking-widest text-sm">Estoque em dia</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2 uppercase italic tracking-tighter"><ArrowLeftRight size={22} className="text-blue-500" /> Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/withdrawals" className="group p-6 bg-blue-600 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 text-center">
              <Users className="mx-auto mb-3 text-white transition-transform group-hover:scale-110" size={32} />
              <p className="text-white font-black uppercase tracking-widest text-xs">Entregar Peça</p>
            </Link>
            <Link to="/transactions" className="group p-6 bg-gray-900 rounded-2xl hover:bg-black transition-all shadow-lg shadow-gray-200 text-center">
              <Plus className="mx-auto mb-3 text-white transition-transform group-hover:scale-110" size={32} />
              <p className="text-white font-black uppercase tracking-widest text-xs">Lançar Entrada</p>
            </Link>
            <Link to="/stock" className="group p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-center">
              <Package className="mx-auto mb-3 text-gray-400 group-hover:text-blue-600 transition-transform group-hover:scale-110" size={32} />
              <p className="text-gray-400 group-hover:text-blue-600 font-black uppercase tracking-widest text-xs">Ver Inventário</p>
            </Link>
            <Link to="/planning" className="group p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-red-500 hover:bg-red-50 transition-all text-center">
              <TrendingDown className="mx-auto mb-3 text-gray-400 group-hover:text-red-600 transition-transform group-hover:scale-110" size={32} />
              <p className="text-gray-400 group-hover:text-red-600 font-black uppercase tracking-widest text-xs">Comprar Peças</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const MaterialWithdrawals: React.FC<{
  withdrawals: StudentWithdrawal[];
  toggleWithdrawal: (sid: string, pid: string) => void;
  students: Student[];
  parts: Part[];
  summary: StockSummary[];
}> = ({ withdrawals, toggleWithdrawal, students, parts, summary }) => {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = useMemo(() =>
    students
      .filter(s => s.class === selectedClass && s.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [students, selectedClass, searchTerm]);

  const isWithdrawn = (sid: string, pid: string) => withdrawals.some(w => w.studentId === sid && w.partId === pid);

  const handleToggle = (sid: string, pid: string) => {
    const alreadyWithdrawn = isWithdrawn(sid, pid);
    const partSummary = summary.find(s => s.partId === pid);

    if (!alreadyWithdrawn && partSummary && partSummary.balance <= 0) {
      alert(`Estoque insuficiente para a peça ${pid}! Por favor, realize uma entrada de material.`);
      return;
    }

    toggleWithdrawal(sid, pid);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div><h2 className="text-2xl font-black text-gray-800 uppercase italic tracking-tighter">Checklist <span className="text-gray-400 not-italic">de Entrega</span></h2></div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="Buscar aluno..." className="pl-10 pr-4 py-2.5 border-2 border-gray-50 rounded-2xl bg-gray-50 focus:bg-white focus:border-blue-500 transition-all outline-none flex-1" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
          <select className="p-2.5 border-2 border-gray-50 rounded-2xl bg-gray-50 font-bold outline-none focus:border-blue-500 transition-all" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select>
        </div>
      </div>
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-900 text-white">
            <tr><th className="p-5 border-r border-gray-800 sticky left-0 bg-gray-900 z-20 uppercase text-xs font-black tracking-widest">Estudante</th>{parts.map(p => {
              const partSummary = summary.find(s => s.partId === p.id);
              const outOfStock = partSummary && partSummary.balance <= 0;
              return (
                <th key={p.id} className={`p-3 text-center border-r border-gray-800 text-[10px] font-black min-w-[65px] uppercase tracking-tighter ${outOfStock ? 'text-red-400' : ''}`}>
                  {p.id}
                  {outOfStock && <div className="text-[8px] text-red-500 mt-0.5">ESGOTADO</div>}
                </th>
              );
            })}</tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, idx) => (
              <tr key={student.id} className={idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                <td className="p-4 border-r border-gray-200 font-bold text-sm whitespace-nowrap sticky left-0 bg-inherit z-10 shadow-sm">{student.name}</td>
                {parts.map(part => {
                  const active = isWithdrawn(student.id, part.id);
                  const partSummary = summary.find(s => s.partId === part.id);
                  const outOfStock = !active && partSummary && partSummary.balance <= 0;

                  return (
                    <td key={part.id} className={`p-2 border-r border-gray-100 text-center cursor-pointer transition-colors ${active ? 'bg-green-100/50' : 'hover:bg-blue-50'} ${outOfStock ? 'bg-red-50/30 cursor-not-allowed opacity-50' : ''}`} onClick={() => handleToggle(student.id, part.id)}>
                      <div className={`mx-auto h-7 w-7 rounded-xl border-2 transition-all flex items-center justify-center ${active ? 'bg-green-500 border-green-600 shadow-md shadow-green-100' : outOfStock ? 'border-red-200 bg-white' : 'border-dashed border-gray-300'}`}>
                        {active && <CheckCircle2 size={16} className="text-white" />}
                        {outOfStock && <X size={12} className="text-red-300" />}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PartsManager: React.FC<{ parts: Part[], onSave: (p: Part, e: boolean) => void, onDelete: (id: string) => void }> = ({ parts, onSave, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [formData, setFormData] = useState<Part>({ id: '', code: '', name: '', targetQuantity: 0 });
  const handleOpenAdd = () => { setEditingPart(null); setFormData({ id: '', code: '', name: '', targetQuantity: 0 }); setIsModalOpen(true); };
  const handleOpenEdit = (p: Part) => { setEditingPart(p); setFormData({ ...p }); setIsModalOpen(true); };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Tarefas <span className="text-gray-400 not-italic">& Códigos</span></h2>
        <button onClick={handleOpenAdd} className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-red-100 flex items-center gap-2 transition-transform hover:scale-105 uppercase tracking-widest text-xs"><PlusCircle size={20} /> Nova Peça</button>
      </div>
      <div className="bg-white rounded-[2rem] shadow-sm border overflow-hidden"><table className="w-full text-left"><thead className="bg-gray-50 border-b"><tr><th className="p-5 uppercase text-[10px] font-black tracking-widest text-gray-400">Tarefa</th><th className="p-5 uppercase text-[10px] font-black tracking-widest text-gray-400">Código</th><th className="p-5 text-center uppercase text-[10px] font-black tracking-widest text-gray-400">Meta</th><th className="p-5 text-center uppercase text-[10px] font-black tracking-widest text-gray-400">Ações</th></tr></thead>
        <tbody>{parts.map(p => (<tr key={p.id} className="hover:bg-gray-50 border-b last:border-0 transition-colors"><td className="p-5 font-black text-gray-800">{p.id} - {p.name}</td><td className="p-5 font-mono text-xs text-blue-600 font-bold">{p.code}</td><td className="p-5 text-center font-black text-gray-900 bg-gray-50/50">{p.targetQuantity}</td><td className="p-5"><div className="flex justify-center gap-3"><button onClick={() => handleOpenEdit(p)} className="p-2.5 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"><Edit2 size={16} /></button><button onClick={() => onDelete(p.id)} className="p-2.5 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"><Trash2 size={16} /></button></div></td></tr>))}</tbody>
      </table></div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPart ? "Editar Peça" : "Nova Peça"}>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData, !!editingPart); setIsModalOpen(false); }} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Identificação</label><input type="text" placeholder="ex: T1" required disabled={!!editingPart} className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50 outline-none focus:border-red-500 transition-all font-bold" value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value.toUpperCase() })} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Meta Turma</label><input type="number" placeholder="0" required className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50 outline-none focus:border-red-500 transition-all font-bold" value={formData.targetQuantity} onChange={e => setFormData({ ...formData, targetQuantity: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Código SENAI</label><input type="text" placeholder="Código SAP/SENAI" className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50 outline-none focus:border-red-500 transition-all font-bold" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} /></div>
          <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Nome da Peça</label><input type="text" placeholder="Nome descritivo" required className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50 outline-none focus:border-red-500 transition-all font-bold" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
          <button type="submit" className="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-100 uppercase tracking-widest text-sm transition-all hover:bg-red-700">Salvar Alterações</button>
        </form>
      </Modal>
    </div>
  );
};

const StockInventory: React.FC<{ summary: StockSummary[] }> = ({ summary }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100">
      <h2 className="text-2xl font-black uppercase italic tracking-tighter">Estoque <span className="text-gray-400 not-italic">Consolidado</span></h2>
      <button onClick={() => window.print()} className="bg-gray-100 p-3 rounded-2xl hover:bg-gray-200 transition-colors"><Download size={22} /></button>
    </div>
    <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border overflow-hidden"><table className="w-full text-left"><thead className="bg-gray-900 text-white"><tr><th className="p-5 uppercase text-[10px] font-black tracking-widest">Tarefa</th><th className="p-5 text-center uppercase text-[10px] font-black tracking-widest">Entradas</th><th className="p-5 text-center uppercase text-[10px] font-black tracking-widest">Saídas</th><th className="p-5 text-center uppercase text-[10px] font-black tracking-widest">Entregues</th><th className="p-5 text-center uppercase text-[10px] font-black tracking-widest">Saldo</th><th className="p-5 text-center uppercase text-[10px] font-black tracking-widest">Status</th></tr></thead>
      <tbody className="divide-y divide-gray-100">{summary.map(item => (<tr key={item.partId} className="hover:bg-gray-50 transition-colors"><td className="p-5 font-black text-gray-900">{item.partId}</td><td className="p-5 text-center text-green-600 font-bold">{item.entries}</td><td className="p-5 text-center text-red-500 font-bold">{item.exits}</td><td className="p-5 text-center text-orange-500 font-bold">{item.studentExits}</td><td className={`p-5 text-center font-black text-lg ${item.situation === 'COMPRAR' ? 'text-red-600 bg-red-50' : 'text-blue-700 bg-blue-50/30'}`}>{item.balance}</td><td className="p-5 text-center"><span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${item.situation === 'OK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 border border-red-200 shadow-sm'}`}>{item.situation}</span></td></tr>))}</tbody>
    </table></div>
  </div>
);

const Planning: React.FC<{ summary: StockSummary[] }> = ({ summary }) => (
  <div className="space-y-6">
    <div className="bg-gray-900 p-10 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 p-10 opacity-10"><TrendingDown size={120} /></div>
      <h2 className="text-4xl font-black uppercase italic tracking-tighter">Compra <span className="text-red-600">Necessária</span></h2>
      <p className="text-gray-400 font-medium max-w-md mt-2 tracking-wide uppercase text-xs">Planejamento estratégico baseado no déficit para as turmas atuais.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {summary.filter(s => s.toBuy > 0).map(item => (
        <div key={item.partId} className="bg-white p-8 rounded-[2rem] shadow-sm border-t-8 border-red-600 flex justify-between items-center group transition-all hover:shadow-xl hover:-translate-y-1">
          <div><span className="text-3xl font-black text-gray-900 italic uppercase">{item.partId}</span><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Cód: {item.code}</p></div>
          <div className="text-right"><span className="text-[10px] font-black text-red-500 block uppercase tracking-widest mb-1">Déficit</span><span className="text-5xl font-black text-red-600 tabular-nums">{item.toBuy}</span></div>
        </div>
      ))}
      {summary.filter(s => s.toBuy > 0).length === 0 && (
        <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
          <Package size={60} className="mx-auto text-gray-200 mb-4" />
          <p className="font-black text-gray-400 uppercase tracking-[0.2em]">Nenhuma compra pendente</p>
        </div>
      )}
    </div>
  </div>
);

const StudentsManager: React.FC<{ students: Student[], onSave: (s: any, id?: string) => void, onDelete: (id: string) => void }> = ({ students, onSave, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', class: CLASSES[0] });
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const filtered = useMemo(() => students.filter(s => s.class === selectedClass), [students, selectedClass]);
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Alunos <span className="text-gray-400 not-italic">& Turmas</span></h2>
        <div className="flex gap-3 w-full md:w-auto">
          <select className="p-3 border-2 border-gray-50 rounded-2xl bg-gray-50 font-black outline-none focus:border-blue-500 transition-all text-sm" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <button onClick={() => { setEditingId(null); setFormData({ name: '', class: selectedClass }); setIsModalOpen(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-100 flex items-center gap-2 uppercase tracking-widest text-xs"><UserPlus size={20} /> Adicionar</button>
        </div>
      </div>
      <div className="bg-white rounded-[2rem] border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <tbody className="divide-y divide-gray-100">
            {filtered.map(s => (<tr key={s.id} className="hover:bg-gray-50 transition-colors"><td className="p-5 font-bold text-gray-700">{s.name}</td><td className="p-5 text-center"><div className="flex justify-end gap-3"><button onClick={() => { setEditingId(s.id); setFormData({ name: s.name, class: s.class }); setIsModalOpen(true); }} className="p-2.5 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"><Edit2 size={16} /></button><button onClick={() => onDelete(s.id)} className="p-2.5 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"><Trash2 size={16} /></button></div></td></tr>))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Aluno" : "Novo Aluno"}>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData, editingId || undefined); setIsModalOpen(false); }} className="space-y-5">
          <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Nome Completo</label><input type="text" placeholder="Nome do estudante" required className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50 outline-none focus:border-blue-600 transition-all font-bold" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
          <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Turma / Período</label><select className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50 font-black outline-none focus:border-blue-600 transition-all" value={formData.class} onChange={e => setFormData({ ...formData, class: e.target.value })}>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-100 uppercase tracking-widest text-sm transition-all hover:bg-blue-700">Salvar Aluno</button>
        </form>
      </Modal>
    </div>
  );
};

const Transactions: React.FC<{ transactions: Transaction[], saveTransaction: (t: any, id?: string) => void, deleteTransaction: (id: string) => void, parts: Part[] }> = ({ transactions, saveTransaction, deleteTransaction, parts }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ date: new Date().toISOString().split('T')[0], type: TransactionType.ENTRY, description: '', partId: parts[0]?.id || '', quantity: 0 });

  useEffect(() => {
    if (parts.length > 0 && !formData.partId) {
      setFormData(prev => ({ ...prev, partId: parts[0].id }));
    }
  }, [parts, formData.partId]);

  const handleEdit = (t: Transaction) => {
    setEditingId(t.id);
    setFormData({
      date: t.date.split('T')[0],
      type: t.type,
      description: t.description,
      partId: t.partId,
      quantity: t.quantity
    });
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleForm = () => {
    if (showAdd) {
      setShowAdd(false);
      setEditingId(null);
      setFormData({ date: new Date().toISOString().split('T')[0], type: TransactionType.ENTRY, description: '', partId: parts[0]?.id || '', quantity: 0 });
    } else {
      setShowAdd(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Movimentação <span className="text-gray-400 not-italic">de Estoque</span></h2>
        <button onClick={handleToggleForm} className={`px-6 py-3 rounded-2xl font-black transition-all flex items-center gap-2 uppercase tracking-widest text-xs ${showAdd ? 'bg-gray-100 text-gray-600' : 'bg-gray-900 text-white shadow-xl shadow-gray-200'}`}>{showAdd ? <X size={20} /> : <Plus size={20} />}</button>
      </div>
      {showAdd && (
        <form onSubmit={(e) => { e.preventDefault(); saveTransaction(formData, editingId || undefined); setShowAdd(false); setEditingId(null); }} className={`bg-white p-8 rounded-[2rem] border-2 ${editingId ? 'border-orange-500' : 'border-blue-500'} grid grid-cols-1 md:grid-cols-6 gap-5 items-end animate-in slide-in-from-top-4 shadow-2xl`}>
          <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Data</label><input type="date" required className="w-full p-3 border-2 border-gray-50 rounded-xl bg-gray-50 font-bold" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} /></div>
          <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Operação</label><select className="w-full p-3 border-2 border-gray-50 rounded-xl bg-gray-50 font-bold" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as TransactionType })}><option value={TransactionType.ENTRY}>Entrada (+)</option><option value={TransactionType.EXIT}>Saída (-)</option></select></div>
          <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Referência</label><input type="text" placeholder="NF, Memorando..." required className="w-full p-3 border-2 border-gray-50 rounded-xl bg-gray-50 font-bold" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
          <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Tarefa</label><select className="w-full p-3 border-2 border-gray-50 rounded-xl bg-gray-50 font-bold" value={formData.partId} onChange={e => setFormData({ ...formData, partId: e.target.value })}>{parts.map(p => <option key={p.id} value={p.id}>{p.id} - {p.name}</option>)}</select></div>
          <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Qtd</label><input type="number" required className="w-full p-3 border-2 border-gray-50 rounded-xl bg-gray-50 font-bold" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} /></div>
          <div className="flex gap-3">
            <button type="submit" className={`w-full px-6 py-3 rounded-xl font-black shadow-lg transition-all ${editingId ? 'bg-orange-600 text-white shadow-orange-100 hover:bg-orange-700' : 'bg-green-600 text-white shadow-green-100 hover:bg-green-700'}`}>{editingId ? 'SALVAR' : 'OK'}</button>
          </div>
        </form>
      )}
      <div className="bg-white rounded-[2rem] shadow-sm border overflow-hidden"><table className="w-full text-left">
        <thead className="bg-gray-50 border-b uppercase text-[10px] font-black text-gray-400 tracking-widest"><tr><th className="p-5">Data</th><th className="p-5">Tipo</th><th className="p-5">Tarefa</th><th className="p-5 text-right">Quantidade</th><th className="p-5 text-center">Ações</th></tr></thead>
        <tbody className="divide-y divide-gray-100">{[...transactions].reverse().map(t => (<tr key={t.id} className="hover:bg-gray-50 border-b last:border-0 transition-colors"><td className="p-5 text-xs font-bold text-gray-400">{formatDate(t.date)}</td><td className="p-5"><span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${t.type === TransactionType.ENTRY ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t.type}</span></td><td className="p-5 font-black text-gray-900">{t.partId}</td><td className="p-5 text-right font-mono font-black text-lg">{t.quantity}</td><td className="p-5 text-center"><div className="flex justify-center gap-2"><button onClick={() => handleEdit(t)} className="text-blue-600 hover:text-blue-800 p-2.5 transition-colors bg-blue-50 rounded-xl"><Edit2 size={16} /></button><button onClick={() => deleteTransaction(t.id)} className="text-gray-300 hover:text-red-600 p-2.5 transition-colors bg-gray-50 rounded-xl"><Trash2 size={16} /></button></div></td></tr>))}</tbody>
      </table></div>
    </div>
  );
};

export default App;
