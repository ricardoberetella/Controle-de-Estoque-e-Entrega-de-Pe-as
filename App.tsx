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
            {/* ✅ único ajuste: passa onLogout para o Dashboard */}
            <Route
              path="/"
              element={
                <Dashboard
                  summary={stockSummary}
                  students={sortedStudents}
                  onLogout={() => {
                    try { sessionStorage.removeItem("muc_auth"); } catch { /* ignore */ }
                    setAuthed(false);
                    window.location.reload();
                  }}
                />
              }
            />
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

// ✅ único ajuste: adiciona prop onLogout
const Dashboard: React.FC<{ summary: StockSummary[], students: Student[], onLogout: () => void }> = ({ summary, students, onLogout }) => {
  const itemsCriticos = summary.filter(s => s.toBuy > 0).length;
  const totalEntregas = summary.reduce((acc, curr) => acc + curr.studentExits, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ✅ único ajuste: botão SAIR no topo */}
      <div className="flex justify-end">
        <button
          onClick={onLogout}
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

// (resto do arquivo permanece igual ao que você já tem)
// OBS: como você colou só até Transactions, o restante continua exatamente como estava no seu App.tsx original.

export default App;
