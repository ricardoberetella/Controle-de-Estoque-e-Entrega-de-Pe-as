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
import { generateId } from './utils';
import { db } from './dataService';

// --- Funções Utilitárias ---
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-red-100 p-6 text-center">
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

// --- App Principal ---

const App: React.FC = () => {
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

  const syncWithCloud = async (action: () => Promise<unknown>) => {
    setSyncing(true);
    try { await action(); } finally { setSyncing(false); }
  };

  const handleSaveStudent = async (s: Omit<Student, 'id'>, id?: string) => {
    const updated = id 
      ? students.map(st => st.id === id ? { ...st, ...s } : st)
      : [...students, { id: generateId(), ...s }];
    setStudents(updated);
    await syncWithCloud(() => db.saveStudents(updated));
  };

  const handleDeleteStudent = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Remover Aluno",
      message: "Deseja excluir este aluno de todas as turmas?",
      onConfirm: async () => {
        const updated = students.filter(s => s.id !== id);
        setStudents(updated);
        await syncWithCloud(() => db.saveStudents(updated));
      }
    });
  };

  const handleSavePart = async (p: Part, isEditing: boolean) => {
    const updated = isEditing ? parts.map(part => part.id === p.id ? { ...p } : part) : [...parts, { ...p }];
    setParts(updated);
    await syncWithCloud(() => db.saveParts(updated));
  };

  const handleDeletePart = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Excluir Tarefa",
      message: `Remover a ${id} permanentemente?`,
      onConfirm: async () => {
        const updatedParts = parts.filter(p => p.id !== id);
        const updatedWithdrawals = withdrawals.filter(w => w.partId !== id);
        setParts(updatedParts);
        setWithdrawals(updatedWithdrawals);
        await syncWithCloud(() => Promise.all([db.saveParts(updatedParts), db.saveWithdrawals(updatedWithdrawals)]));
      }
    });
  };

  const handleAddTransaction = async (t: Omit<Transaction, 'id'>) => {
    const updated = [...transactions, { ...t, id: generateId() }];
    setTransactions(updated);
    await syncWithCloud(() => db.saveTransactions(updated));
  };

  const handleDeleteTransaction = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Estornar Lançamento",
      message: "Remover este registro de movimentação?",
      onConfirm: async () => {
        const updated = transactions.filter(t => t.id !== id);
        setTransactions(updated);
        await syncWithCloud(() => db.saveTransactions(updated));
      }
    });
  };

  const toggleWithdrawal = async (studentId: string, partId: string) => {
    const existing = withdrawals.find(w => w.studentId === studentId && w.partId === partId);
    const updated = existing 
      ? withdrawals.filter(w => w !== existing)
      : [...withdrawals, { studentId, partId, date: new Date().toISOString() }];
    setWithdrawals(updated);
    await syncWithCloud(() => db.saveWithdrawals(updated));
  };

  const stockSummary = useMemo(() => {
    return [...parts].sort((a, b) => sortTaskIds(a.id, b.id)).map(part => {
      const entries = transactions.filter(t => t.partId === part.id && t.type === TransactionType.ENTRY).reduce((sum, t) => sum + t.quantity, 0);
      const exits = transactions.filter(t => t.partId === part.id && t.type === TransactionType.EXIT).reduce((sum, t) => sum + t.quantity, 0);
      const studentExits = withdrawals.filter(w => w.partId === part.id).length;
      const balance = entries - exits - studentExits;
      return { 
        partId: part.id, code: part.code, entries, exits, studentExits, balance, 
        situation: balance >= part.targetQuantity ? 'OK' : 'COMPRAR', 
        toBuy: Math.max(0, part.targetQuantity - balance) 
      } as StockSummary;
    });
  }, [transactions, withdrawals, parts]);

  if (loading) return <LoadingOverlay />;

  return (
    <Router>
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
        <aside className="hidden md:flex flex-col w-64 bg-gray-900 h-screen sticky top-0 shadow-2xl z-50">
          <div className="p-8 border-b border-gray-800 bg-gray-950 flex justify-between items-start">
            <div>
              <div className="bg-red-600 h-1.5 w-12 mb-4 rounded-full"></div>
              <h1 className="text-white font-black text-2xl tracking-tighter italic leading-none">SENAI<br/><span className="text-gray-400 font-medium text-[10px] tracking-widest uppercase not-italic">Usinagem</span></h1>
            </div>
            <div className="mt-1">
              {syncing ? <Loader2 className="w-4 h-4 text-blue-400 animate-spin" /> : <CloudDownload className="w-4 h-4 text-green-500" />}
            </div>
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
          <Routes>
            <Route path="/" element={<Dashboard summary={stockSummary} students={students} />} />
            <Route path="/withdrawals" element={<MaterialWithdrawals withdrawals={withdrawals} toggleWithdrawal={toggleWithdrawal} students={students} parts={[...parts].sort((a,b) => sortTaskIds(a.id, b.id))} />} />
            <Route path="/transactions" element={<Transactions transactions={transactions} addTransaction={handleAddTransaction} deleteTransaction={handleDeleteTransaction} parts={[...parts].sort((a,b) => sortTaskIds(a.id, b.id))} />} />
            <Route path="/stock" element={<StockInventory summary={stockSummary} />} />
            <Route path="/planning" element={<Planning summary={stockSummary} />} />
            <Route path="/parts" element={<PartsManager parts={parts} onSave={handleSavePart} onDelete={handleDeletePart} />} />
            <Route path="/students" element={<StudentsManager students={students} onSave={handleSaveStudent} onDelete={handleDeleteStudent} />} />
          </Routes>
        </main>

        <ConfirmModal 
          isOpen={!!confirmConfig?.isOpen}
          onClose={() => setConfirmConfig(null)}
          onConfirm={confirmConfig?.onConfirm || (() => {})}
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

// --- Sub-componentes ---

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
  const itemsCriticos = summary.filter(s => s.balance < (s.entries * 0.1)).length;
  const totalEntregas = summary.reduce((acc, curr) => acc + curr.studentExits, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-shrink-0">
          <div className="relative p-6 bg-red-600 rounded-2xl shadow-lg shadow-red-200 group transition-transform hover:scale-105">
            <div className="flex items-center justify-center">
               <img 
                src="https://upload.wikimedia.org/wikipedia/commons/8/8c/SENAI_Logo.svg" 
                alt="SENAI Logo" 
                className="h-12 w-auto brightness-0 invert" 
              />
            </div>
          </div>
        </div>
        <div className="text-center md:text-left flex-1 space-y-3">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-none uppercase italic tracking-tighter">Mecânico de Usinagem Convencional</h2>
          <p className="text-lg md:text-xl font-bold text-gray-500 uppercase tracking-tight">Controle de Estoque e Entrega de Peças</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest rounded-full border border-red-100">
              <Package size={14} /> Gestão de Almoxarifado
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users size={28}/>} color="blue" label="Alunos" value={students.length} />
        <StatCard icon={<Package size={28}/>} color="green" label="Estoque" value={summary.reduce((acc, curr) => acc + curr.balance, 0)} />
        <StatCard icon={<CheckCircle2 size={28}/>} color="purple" label="Entregues" value={totalEntregas} />
        <StatCard icon={<AlertCircle size={28}/>} color="red" label="Críticos" value={itemsCriticos} />
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
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2 uppercase italic tracking-tighter"><ArrowLeftRight size={22} className="text-blue-500" /> Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-4">
            <QuickActionLink to="/withdrawals" icon={<Users className="text-white" size={32}/>} label="Entregar Peça" bgColor="bg-blue-600" />
            <QuickActionLink to="/transactions" icon={<Plus className="text-white" size={32}/>} label="Lançar Entrada" bgColor="bg-gray-900" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, color, label, value }: any) => (
  <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-5 transition-all hover:shadow-md">
    <div className={`p-4 rounded-2xl bg-${color}-50 text-${color}-600 border border-${color}-100`}>{icon}</div>
    <div><p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{label}</p><p className="text-3xl font-black text-gray-900">{value}</p></div>
  </div>
);

const QuickActionLink = ({ to, icon, label, bgColor }: any) => (
  <Link to={to} className={`group p-6 ${bgColor} rounded-2xl transition-all shadow-lg text-center hover:scale-[1.02]`}>
    <div className="mx-auto mb-3 transition-transform group-hover:scale-110">{icon}</div>
    <p className="text-white font-black uppercase tracking-widest text-xs">{label}</p>
  </Link>
);

const MaterialWithdrawals: React.FC<{ withdrawals: StudentWithdrawal[]; toggleWithdrawal: (sid: string, pid: string) => void; students: Student[]; parts: Part[]; }> = ({ withdrawals, toggleWithdrawal, students, parts }) => {
  const [selectedClass, setSelectedClass] = useState(CLASSES[3]);
  const [searchTerm, setSearchTerm] = useState('');
  const filteredStudents = useMemo(() => students.filter(s => s.class === selectedClass && s.name.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => sortAlphabetically(a.name, b.name)), [students, selectedClass, searchTerm]);
  const isWithdrawn = (sid: string, pid: string) => withdrawals.some(w => w.studentId === sid && w.partId === pid);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-black text-gray-800 uppercase italic tracking-tighter">Checklist <span className="text-gray-400 not-italic">de Entrega</span></h2>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Buscar aluno..." className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-50 rounded-2xl bg-gray-50 focus:bg-white focus:border-blue-500 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="p-2.5 border-2 border-gray-50 rounded-2xl bg-gray-50 font-bold outline-none focus:border-blue-500" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select>
        </div>
      </div>
      <div className="bg-white rounded-[2rem] shadow-xl overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="p-5 sticky left-0 bg-gray-900 z-20 uppercase text-xs font-black tracking-widest">Estudante</th>
              {parts.map(p => (<th key={p.id} className="p-3 text-center text-[10px] font-black min-w-[65px] uppercase">{p.id}</th>))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, idx) => (
              <tr key={student.id} className={idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                <td className="p-4 border-r border-gray-200 font-bold text-sm sticky left-0 bg-inherit z-10">{student.name}</td>
                {parts.map(part => {
                  const active = isWithdrawn(student.id, part.id);
                  return (
                    <td key={part.id} className="p-2 border-r border-gray-100 text-center cursor-pointer" onClick={() => toggleWithdrawal(student.id, part.id)}>
                      <div className={`mx-auto h-7 w-7 rounded-xl border-2 flex items-center justify-center transition-all ${active ? 'bg-green-500 border-green-600' : 'border-dashed border-gray-300'}`}>
                        {active && <CheckCircle2 size={16} className="text-white" />}
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

const StockInventory: React.FC<{ summary: StockSummary[] }> = ({ summary }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100">
      <h2 className="text-2xl font-black uppercase italic tracking-tighter">Estoque <span className="text-gray-400 not-italic">Consolidado</span></h2>
      <button onClick={() => window.print()} className="bg-gray-100 p-3 rounded-2xl hover:bg-gray-200 transition-colors"><Download size={22} /></button>
    </div>
    <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-900 text-white">
          <tr>
            <th className="p-5 uppercase text-[10px] font-black tracking-widest">Tarefa</th>
            <th className="p-5 text-center uppercase text-[10px] font-black tracking-widest">Entradas</th>
            <th className="p-5 text-center uppercase text-[10px] font-black tracking-widest">Saídas</th>
            <th className="p-5 text-center uppercase text-[10px] font-black tracking-widest">Entregues</th>
            <th className="p-5 text-center uppercase text-[10px] font-black tracking-widest">Saldo</th>
            <th className="p-5 text-center uppercase text-[10px] font-black tracking-widest">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {summary.map(item => (
            <tr key={item.partId} className="hover:bg-gray-50 transition-colors">
              <td className="p-5 font-black text-gray-900">{item.partId}</td>
              <td className="p-5 text-center text-green-600 font-bold">{item.entries}</td>
              <td className="p-5 text-center text-red-500 font-bold">{item.exits}</td>
              <td className="p-5 text-center text-orange-500 font-bold">{item.studentExits}</td>
              <td className={`p-5 text-center font-black text-lg ${item.balance < 5 ? 'text-red-600 bg-red-50' : 'text-blue-700 bg-blue-50/30'}`}>{item.balance}</td>
              <td className="p-5 text-center">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${item.situation === 'OK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {item.situation}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Fallback components para rotas pendentes (exemplo)
const Transactions = ({ ...props }: any) => <div className="p-8 bg-white rounded-3xl border">Componente de Movimentação em construção</div>;
const Planning = ({ ...props }: any) => <div className="p-8 bg-white rounded-3xl border">Componente de Planejamento em construção</div>;
const StudentsManager = ({ ...props }: any) => <div className="p-8 bg-white rounded-3xl border">Componente de Alunos em construção</div>;
const PartsManager = ({ ...props }: any) => <div className="p-8 bg-white rounded-3xl border">Componente de Peças em construção</div>;

export default App;
