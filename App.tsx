
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

const SenaiLogo: React.FC<{ className?: string; sizeClass?: string }> = ({ className = "", sizeClass = "text-3xl" }) => (
  <div className={`flex items-center select-none ${className}`}>
    <span className={`text-red-600 font-[900] ${sizeClass} tracking-tighter italic leading-none`}>SENAI</span>
  </div>
);

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-300">
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-700 text-lg font-bold animate-pulse">Sincronizando...</p>
    </div>
  </div>
);

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-black text-gray-800">{title}</h3>
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
      <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-red-100 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4"><TriangleAlert className="h-6 w-6 text-red-600" /></div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl text-base">Cancelar</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-100 text-base">Excluir</button>
        </div>
      </div>
    </div>
  );
};

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
    try {
      await action();
    } finally {
      setSyncing(false);
    }
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
      message: "Deseja excluir este aluno?",
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
      message: "Remover este registro?",
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
        {/* Sidebar - Reduzida para tablets */}
        <aside className="hidden md:flex flex-col w-64 bg-gray-900 h-screen sticky top-0 shadow-2xl z-50">
          <div className="p-6 border-b border-gray-800 bg-gray-950 flex justify-between items-center">
            <div className="flex flex-col gap-2">
              <SenaiLogo sizeClass="text-2xl" />
              <div className="flex flex-col">
                <h1 className="text-white font-black text-base tracking-tight uppercase leading-none">Mecânico</h1>
                <span className="text-gray-500 font-bold text-[10px] tracking-widest uppercase mt-1">Usinagem Convencional</span>
              </div>
            </div>
            <div>
              {syncing ? <Loader2 className="w-4 h-4 text-gray-400 animate-spin" /> : <CloudDownload className="w-4 h-4 text-green-500" />}
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-2 mt-2 overflow-y-auto">
            <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Início" />
            <div className="px-3 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Almoxarifado</div>
            <NavItem to="/withdrawals" icon={<Users size={20} />} label="Retirada Alunos" />
            <NavItem to="/transactions" icon={<ArrowLeftRight size={20} />} label="Movimentação" />
            <NavItem to="/stock" icon={<Package size={20} />} label="Ver Estoque" />
            <NavItem to="/planning" icon={<TrendingDown size={20} />} label="Planejamento" />
            <div className="px-3 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Configuração</div>
            <NavItem to="/parts" icon={<Settings size={20} />} label="Peças / Tarefas" />
            <NavItem to="/students" icon={<UserPlus size={20} />} label="Alunos / Turmas" />
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-8 pb-24 min-w-0">
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
          <MobileNavItem to="/" icon={<LayoutDashboard size={24} />} />
          <MobileNavItem to="/withdrawals" icon={<Users size={24} />} />
          <MobileNavItem to="/transactions" icon={<ArrowLeftRight size={24} />} />
          <MobileNavItem to="/stock" icon={<Package size={24} />} />
        </nav>
      </div>
    </Router>
  );
};

// --- Sub-componentes ---

const NavItem: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (<Link to={to} className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${active ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>{icon}<span className="font-bold text-sm md:text-base">{label}</span></Link>);
};

const MobileNavItem: React.FC<{ to: string, icon: React.ReactNode }> = ({ to, icon }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (<Link to={to} className={`p-3 rounded-2xl transition-all ${active ? 'bg-gray-100 text-red-600 shadow-inner' : 'text-gray-400'}`}>{icon}</Link>);
};

const Dashboard: React.FC<{ summary: StockSummary[], students: Student[] }> = ({ summary, students }) => {
  const itemsCriticos = summary.filter(s => s.balance < (s.entries * 0.1)).length;
  const totalEntregas = summary.reduce((acc, curr) => acc + curr.studentExits, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Cabeçalho Ajustado para Tablets */}
      <header className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row items-center gap-6 md:gap-10">
        <div className="flex-shrink-0">
          <SenaiLogo sizeClass="text-5xl md:text-6xl" />
        </div>
        
        <div className="text-center md:text-left flex-1 space-y-3">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight uppercase tracking-tight italic">
              Mecânico de Usinagem Convencional
            </h2>
            <p className="text-sm md:text-base font-bold text-gray-400 uppercase tracking-widest">
              Controle de Materiais & Ferramentas
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-200">
              <Package size={14} /> Almoxarifado
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-200">
              <Users size={14} /> Oficinas
            </span>
          </div>
        </div>
      </header>

      {/* Estatísticas - Compactas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-3 transition-all hover:shadow-md">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100"><Users size={24} /></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Alunos</p><p className="text-xl font-black text-gray-900 mt-1">{students.length}</p></div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-3 transition-all hover:shadow-md">
          <div className="p-3 rounded-xl bg-green-50 text-green-600 border border-green-100"><Package size={24} /></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Estoque</p><p className="text-xl font-black text-gray-900 mt-1">{summary.reduce((acc, curr) => acc + curr.balance, 0)}</p></div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-3 transition-all hover:shadow-md">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100"><CheckCircle2 size={24} /></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Entregues</p><p className="text-xl font-black text-gray-900 mt-1">{totalEntregas}</p></div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-3 transition-all hover:shadow-md">
          <div className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-100"><AlertCircle size={24} /></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Críticos</p><p className="text-xl font-black text-gray-900 mt-1">{itemsCriticos}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 uppercase italic tracking-tighter"><TrendingDown size={20} className="text-orange-500" /> Reposição</h3>
            <Link to="/planning" className="text-[10px] font-black text-gray-400 hover:text-red-600 uppercase tracking-widest transition-colors">Ver tudo</Link>
          </div>
          <div className="space-y-3">
            {summary.filter(s => s.toBuy > 0).slice(0, 4).map(item => (
              <div key={item.partId} className="flex justify-between items-center p-3 bg-gray-50 hover:bg-red-50/50 rounded-xl border border-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center bg-white rounded-lg font-black text-base text-gray-700 border border-gray-200">{item.partId}</div>
                  <div><p className="font-black text-sm text-gray-800 leading-tight">{item.name}</p><p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{item.code}</p></div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">Falta</p>
                  <p className="text-lg font-black text-red-600 leading-none">{item.toBuy}</p>
                </div>
              </div>
            ))}
            {summary.filter(s => s.toBuy > 0).length === 0 && (
              <div className="p-10 text-center space-y-2 opacity-50">
                <CheckCircle2 size={32} className="mx-auto text-green-500" />
                <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Em ordem</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2 uppercase italic tracking-tighter"><ArrowLeftRight size={20} className="text-blue-500" /> Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/withdrawals" className="group p-4 bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 text-center">
              <Users className="mx-auto mb-2 text-white" size={24} />
              <p className="text-white font-black uppercase tracking-widest text-[10px]">Entregar Peça</p>
            </Link>
            <Link to="/transactions" className="group p-4 bg-gray-900 rounded-xl hover:bg-black transition-all shadow-md shadow-gray-200 text-center">
              <Plus className="mx-auto mb-2 text-white" size={24} />
              <p className="text-white font-black uppercase tracking-widest text-[10px]">Lançar Entrada</p>
            </Link>
            <Link to="/stock" className="group p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-center">
              <Package className="mx-auto mb-2 text-gray-400 group-hover:text-blue-600" size={24} />
              <p className="text-gray-400 group-hover:text-blue-600 font-black uppercase tracking-widest text-[10px]">Inventário</p>
            </Link>
            <Link to="/planning" className="group p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all text-center">
              <TrendingDown className="mx-auto mb-2 text-gray-400 group-hover:text-red-600" size={24} />
              <p className="text-gray-400 group-hover:text-red-600 font-black uppercase tracking-widest text-[10px]">Compras</p>
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
}> = ({ withdrawals, toggleWithdrawal, students, parts }) => {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const filteredStudents = useMemo(() => students.filter(s => s.class === selectedClass && s.name.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => sortAlphabetically(a.name, b.name)), [students, selectedClass, searchTerm]);
  const isWithdrawn = (sid: string, pid: string) => withdrawals.some(w => w.studentId === sid && w.partId === pid);
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div><h2 className="text-xl font-black text-gray-800 uppercase italic tracking-tighter">Checklist <span className="text-gray-400 not-italic">Entrega</span></h2></div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Buscar aluno..." className="w-full pl-10 pr-4 py-2 text-sm border-2 border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:border-red-500 transition-all outline-none font-bold" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="px-4 py-2 border-2 border-gray-100 rounded-xl bg-gray-50 font-black text-xs outline-none focus:border-red-500 transition-all" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select>
        </div>
      </div>
      <div className="bg-white rounded-[1.5rem] shadow-xl shadow-gray-200/50 border overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-900 text-white">
            <tr><th className="p-4 border-r border-gray-800 sticky left-0 bg-gray-900 z-20 uppercase text-[10px] font-black tracking-widest whitespace-nowrap">Estudante</th>{parts.map(p => (<th key={p.id} className="p-2 text-center border-r border-gray-800 text-[9px] font-black min-w-[60px] uppercase tracking-tighter">{p.id}</th>))}</tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, idx) => (
              <tr key={student.id} className={`${idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'} border-b border-gray-100`}>
                <td className="p-4 border-r border-gray-200 font-black text-sm text-gray-700 whitespace-nowrap sticky left-0 bg-inherit z-10 shadow-sm">{student.name}</td>
                {parts.map(part => {
                  const active = isWithdrawn(student.id, part.id);
                  return (<td key={part.id} className={`p-2 border-r border-gray-100 text-center cursor-pointer transition-colors ${active ? 'bg-green-100/30' : 'hover:bg-red-50'}`} onClick={() => toggleWithdrawal(student.id, part.id)}>
                    <div className={`mx-auto h-8 w-8 rounded-lg border-2 transition-all flex items-center justify-center ${active ? 'bg-green-500 border-green-600 shadow-md shadow-green-100' : 'border-dashed border-gray-200 bg-white'}`}>{active && <CheckCircle2 size={18} className="text-white" />}</div>
                  </td>);
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
  const sortedParts = useMemo(() => [...parts].sort((a, b) => sortTaskIds(a.id, b.id)), [parts]);
  const handleOpenAdd = () => { setEditingPart(null); setFormData({ id: '', code: '', name: '', targetQuantity: 0 }); setIsModalOpen(true); };
  const handleOpenEdit = (p: Part) => { setEditingPart(p); setFormData({ ...p }); setIsModalOpen(true); };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100">
        <h2 className="text-xl font-black italic uppercase tracking-tighter">Peças <span className="text-gray-400 not-italic">& Tarefas</span></h2>
        <button onClick={handleOpenAdd} className="bg-gray-900 text-white px-5 py-3 rounded-xl font-black shadow-md shadow-gray-200 flex items-center gap-2 transition-transform hover:scale-105 uppercase tracking-widest text-[10px]"><PlusCircle size={18} /> Nova Peça</button>
      </div>
      <div className="bg-white rounded-[1.5rem] shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 uppercase text-[10px] font-black tracking-widest text-gray-400">Tarefa</th>
              <th className="p-4 uppercase text-[10px] font-black tracking-widest text-gray-400">Código</th>
              <th className="p-4 text-center uppercase text-[10px] font-black tracking-widest text-gray-400">Meta</th>
              <th className="p-4 text-center uppercase text-[10px] font-black tracking-widest text-gray-400">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedParts.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors text-sm">
                <td className="p-4 font-black text-gray-800">{p.id} - {p.name}</td>
                <td className="p-4 font-mono text-xs text-blue-600 font-black">{p.code}</td>
                <td className="p-4 text-center font-black text-base text-gray-900 bg-gray-50/50">{p.targetQuantity}</td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => handleOpenEdit(p)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => onDelete(p.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPart ? "Editar Peça" : "Nova Peça"}>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData, !!editingPart); setIsModalOpen(false); }} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Tarefa (ID)</label><input type="text" required disabled={!!editingPart} className="w-full p-3 border-2 border-gray-100 rounded-xl bg-gray-50 font-black" value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value.toUpperCase() })} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Meta</label><input type="number" required className="w-full p-3 border-2 border-gray-100 rounded-xl bg-gray-50 font-black" value={formData.targetQuantity} onChange={e => setFormData({ ...formData, targetQuantity: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Código SAP</label><input type="text" className="w-full p-3 border-2 border-gray-100 rounded-xl bg-gray-50 font-black" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} /></div>
          <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Descrição</label><input type="text" required className="w-full p-3 border-2 border-gray-100 rounded-xl bg-gray-50 font-black" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
          <button type="submit" className="w-full bg-red-600 text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest text-sm transition-all hover:bg-red-700">Salvar Dados</button>
        </form>
      </Modal>
    </div>
  );
};

const StockInventory: React.FC<{ summary: StockSummary[] }> = ({ summary }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100">
      <h2 className="text-xl font-black uppercase italic tracking-tighter">Estoque <span className="text-gray-400 not-italic">Consolidado</span></h2>
      <button onClick={() => window.print()} className="bg-gray-100 p-3 rounded-xl hover:bg-gray-200 transition-colors text-gray-600"><Download size={20} /></button>
    </div>
    <div className="bg-white rounded-[1.5rem] shadow-xl shadow-gray-200/50 border overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-900 text-white">
          <tr className="text-[9px] uppercase font-black tracking-widest">
            <th className="p-4">Tarefa</th>
            <th className="p-4 text-center">Entradas</th>
            <th className="p-4 text-center">Saídas</th>
            <th className="p-4 text-center">Saldo</th>
            <th className="p-4 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {summary.map(item => (
            <tr key={item.partId} className="hover:bg-gray-50 transition-colors text-sm">
              <td className="p-4 font-black text-gray-900">{item.partId}</td>
              <td className="p-4 text-center text-green-600 font-black">{item.entries}</td>
              <td className="p-4 text-center text-red-500 font-black">{item.exits + item.studentExits}</td>
              <td className={`p-4 text-center font-black text-lg ${item.balance < 5 ? 'text-red-600 bg-red-50' : 'text-blue-700 bg-blue-50/30'}`}>{item.balance}</td>
              <td className="p-4 text-center">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.situation === 'OK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 border border-red-200'}`}>
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

const Planning: React.FC<{ summary: StockSummary[] }> = ({ summary }) => (
  <div className="space-y-6">
    <div className="bg-gray-900 p-8 rounded-[2rem] shadow-2xl text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10"><TrendingDown size={120} /></div>
      <h2 className="text-3xl font-black uppercase italic tracking-tighter">Compra <span className="text-red-600">Necessária</span></h2>
      <p className="text-gray-400 font-bold max-w-lg mt-2 tracking-widest uppercase text-xs">Análise de estoque baseada nas metas atuais.</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {summary.filter(s => s.toBuy > 0).map(item => (
        <div key={item.partId} className="bg-white p-6 rounded-[1.5rem] shadow-sm border-t-8 border-red-600 flex justify-between items-center group transition-all hover:shadow-lg">
          <div>
            <span className="text-3xl font-black text-gray-900 italic uppercase">{item.partId}</span>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Cód: {item.code}</p>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-black text-red-500 block uppercase tracking-widest">Faltam</span>
            <span className="text-4xl font-black text-red-600 tabular-nums">{item.toBuy}</span>
          </div>
        </div>
      ))}
      {summary.filter(s => s.toBuy > 0).length === 0 && (
        <div className="col-span-full py-20 text-center bg-white rounded-[1.5rem] border-4 border-dashed border-gray-100">
           <Package size={48} className="mx-auto text-gray-200 mb-4" />
           <p className="font-black text-gray-400 uppercase tracking-widest text-lg">Estoque Completo</p>
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
  const filtered = useMemo(() => students.filter(s => s.class === selectedClass).sort((a, b) => sortAlphabetically(a.name, b.name)), [students, selectedClass]);
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-black italic uppercase tracking-tighter">Alunos <span className="text-gray-400 not-italic">& Turmas</span></h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select className="px-4 py-2 border-2 border-gray-100 rounded-xl bg-gray-50 font-black text-xs outline-none focus:border-blue-600 transition-all" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <button onClick={() => { setEditingId(null); setFormData({ name: '', class: selectedClass }); setIsModalOpen(true); }} className="bg-blue-600 text-white px-5 py-3 rounded-xl font-black shadow-md shadow-blue-100 flex items-center gap-2 uppercase tracking-widest text-[10px]"><UserPlus size={20} /> Cadastrar</button>
        </div>
      </div>
      <div className="bg-white rounded-[1.5rem] border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <tbody className="divide-y divide-gray-100">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors text-sm">
                <td className="p-4 font-black text-gray-700">{s.name}</td>
                <td className="p-4 text-center">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setEditingId(s.id); setFormData({ name: s.name, class: s.class }); setIsModalOpen(true); }} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => onDelete(s.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Aluno" : "Novo Aluno"}>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData, editingId || undefined); setIsModalOpen(false); }} className="space-y-6">
          <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Nome Completo</label><input type="text" required className="w-full p-4 border-2 border-gray-100 rounded-xl bg-gray-50 font-black text-base" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
          <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Turma</label><select className="w-full p-4 border-2 border-gray-100 rounded-xl bg-gray-50 font-black text-base outline-none focus:border-blue-600 transition-all" value={formData.class} onChange={e => setFormData({ ...formData, class: e.target.value })}>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest text-sm transition-all hover:bg-blue-700">Confirmar</button>
        </form>
      </Modal>
    </div>
  );
};

const Transactions: React.FC<{ transactions: Transaction[], addTransaction: (t: any) => void, deleteTransaction: (id: string) => void, parts: Part[] }> = ({ transactions, addTransaction, deleteTransaction, parts }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ date: new Date().toISOString().split('T')[0], type: TransactionType.ENTRY, description: '', partId: parts[0]?.id || '', quantity: 0 });
  
  useEffect(() => {
    if (!formData.partId && parts.length > 0) {
      setFormData(prev => ({ ...prev, partId: parts[0].id }));
    }
  }, [parts]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100">
        <h2 className="text-xl font-black italic uppercase tracking-tighter">Fluxo <span className="text-gray-400 not-italic">Estoque</span></h2>
        <button onClick={() => setShowAdd(!showAdd)} className={`p-3 rounded-xl font-black transition-all flex items-center gap-2 uppercase tracking-widest text-[10px] ${showAdd ? 'bg-gray-100 text-gray-600' : 'bg-gray-900 text-white shadow-xl'}`}>{showAdd ? <X size={20} /> : <Plus size={20} />}</button>
      </div>
      {showAdd && (
        <form onSubmit={(e) => { e.preventDefault(); addTransaction(formData); setShowAdd(false); }} className="bg-white p-6 rounded-[1.5rem] border-2 border-gray-900 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end animate-in slide-in-from-top-4 shadow-xl">
          <div className="space-y-1"><label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Data</label><input type="date" required className="w-full p-3 border-2 border-gray-100 rounded-xl bg-gray-50 font-black text-sm" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} /></div>
          <div className="space-y-1"><label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Tipo</label><select className="w-full p-3 border-2 border-gray-100 rounded-xl bg-gray-50 font-black text-sm" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as TransactionType })}><option value={TransactionType.ENTRY}>Entrada</option><option value={TransactionType.EXIT}>Saída</option></select></div>
          <div className="space-y-1"><label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Referência</label><input type="text" placeholder="NF, Memorando..." required className="w-full p-3 border-2 border-gray-100 rounded-xl bg-gray-50 font-black text-sm" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
          <div className="space-y-1"><label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Tarefa</label><select className="w-full p-3 border-2 border-gray-100 rounded-xl bg-gray-50 font-black text-sm" value={formData.partId} onChange={e => setFormData({ ...formData, partId: e.target.value })}>{parts.map(p => <option key={p.id} value={p.id}>{p.id} - {p.name}</option>)}</select></div>
          <div className="flex gap-2">
            <div className="space-y-1 flex-1"><label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Qtd</label><input type="number" required className="w-full p-3 border-2 border-gray-100 rounded-xl bg-gray-50 font-black text-sm" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} /></div>
            <button type="submit" className="bg-green-600 text-white px-5 py-3 rounded-xl font-black shadow-md transition-all hover:bg-green-700 text-sm">OK</button>
          </div>
        </form>
      )}
      <div className="bg-white rounded-[1.5rem] shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b uppercase text-[9px] font-black text-gray-400 tracking-widest">
            <tr>
              <th className="p-4">Data</th>
              <th className="p-4">Tipo</th>
              <th className="p-4">Tarefa</th>
              <th className="p-4 text-right">Qtd</th>
              <th className="p-4 text-center">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[...transactions].reverse().map(t => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors text-sm">
                <td className="p-4 text-[10px] font-bold text-gray-400">{formatDate(t.date)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-[8px] font-black tracking-widest ${t.type === TransactionType.ENTRY ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {t.type}
                  </span>
                </td>
                <td className="p-4 font-black text-gray-900">{t.partId}</td>
                <td className="p-4 text-right font-mono font-black">{t.quantity}</td>
                <td className="p-4 text-center">
                  <button onClick={() => deleteTransaction(t.id)} className="text-gray-300 hover:text-red-600 p-2 transition-colors bg-gray-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
