
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

const SenaiLogo: React.FC<{ className?: string; sizeClass?: string }> = ({ className = "", sizeClass = "text-4xl" }) => (
  <div className={`flex items-center select-none ${className}`}>
    <span className={`text-red-600 font-[900] ${sizeClass} tracking-tighter italic leading-none`}>SENAI</span>
  </div>
);

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-300">
    <div className="text-center">
      <Loader2 className="w-16 h-16 text-red-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-700 text-xl font-bold animate-pulse">Sincronizando dados...</p>
    </div>
  </div>
);

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-8 border-b border-gray-100">
          <h3 className="text-2xl font-black text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1"><X size={32} /></button>
        </div>
        <div className="p-8">{children}</div>
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
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-red-100 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6"><TriangleAlert className="h-8 w-8 text-red-600" /></div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-base text-gray-500 mb-8">{message}</p>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl text-lg">Cancelar</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 px-6 py-4 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-100 text-lg">Excluir</button>
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

  // Inicialização Assíncrona
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

  // Persistência Automática
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
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-72 bg-gray-900 h-screen sticky top-0 shadow-2xl z-50">
          <div className="p-8 border-b border-gray-800 bg-gray-950 flex justify-between items-center">
            <div className="flex flex-col gap-3">
              <SenaiLogo sizeClass="text-3xl" />
              <div className="flex flex-col">
                <h1 className="text-white font-black text-lg tracking-tight uppercase leading-none">Mecânico</h1>
                <span className="text-gray-500 font-bold text-[11px] tracking-widest uppercase mt-1">Usinagem Convencional</span>
              </div>
            </div>
            <div>
              {syncing ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> : <CloudDownload className="w-5 h-5 text-green-500" />}
            </div>
          </div>
          <nav className="flex-1 p-6 space-y-3 mt-4 overflow-y-auto">
            <NavItem to="/" icon={<LayoutDashboard size={24} />} label="Início" />
            <div className="px-3 py-6 text-[11px] font-black text-gray-500 uppercase tracking-widest">Almoxarifado</div>
            <NavItem to="/withdrawals" icon={<Users size={24} />} label="Retirada Alunos" />
            <NavItem to="/transactions" icon={<ArrowLeftRight size={24} />} label="Movimentação" />
            <NavItem to="/stock" icon={<Package size={24} />} label="Ver Estoque" />
            <NavItem to="/planning" icon={<TrendingDown size={24} />} label="Planejamento" />
            <div className="px-3 py-6 text-[11px] font-black text-gray-500 uppercase tracking-widest">Configuração</div>
            <NavItem to="/parts" icon={<Settings size={24} />} label="Peças / Tarefas" />
            <NavItem to="/students" icon={<UserPlus size={24} />} label="Alunos / Turmas" />
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-12 pb-32 min-w-0">
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

        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around p-4 z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.15)]">
          <MobileNavItem to="/" icon={<LayoutDashboard size={28} />} />
          <MobileNavItem to="/withdrawals" icon={<Users size={28} />} />
          <MobileNavItem to="/transactions" icon={<ArrowLeftRight size={28} />} />
          <MobileNavItem to="/stock" icon={<Package size={28} />} />
        </nav>
      </div>
    </Router>
  );
};

// --- Sub-componentes ---

const NavItem: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (<Link to={to} className={`flex items-center space-x-4 p-4 rounded-2xl transition-all ${active ? 'bg-gray-800 text-white shadow-xl' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>{icon}<span className="font-bold text-base md:text-lg">{label}</span></Link>);
};

const MobileNavItem: React.FC<{ to: string, icon: React.ReactNode }> = ({ to, icon }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (<Link to={to} className={`p-4 rounded-[1.5rem] transition-all ${active ? 'bg-gray-100 text-red-600 shadow-inner' : 'text-gray-400'}`}>{icon}</Link>);
};

const Dashboard: React.FC<{ summary: StockSummary[], students: Student[] }> = ({ summary, students }) => {
  const itemsCriticos = summary.filter(s => s.balance < (s.entries * 0.1)).length;
  const totalEntregas = summary.reduce((acc, curr) => acc + curr.studentExits, 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Cabeçalho Proeminente */}
      <header className="bg-white p-10 md:p-14 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row items-center gap-10 md:gap-16">
        <div className="flex-shrink-0">
          <SenaiLogo sizeClass="text-7xl md:text-9xl" />
        </div>
        
        <div className="text-center md:text-left flex-1 space-y-6">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight uppercase tracking-tight italic">
              Mecânico de Usinagem Convencional
            </h2>
            <p className="text-xl md:text-2xl font-bold text-gray-400 uppercase tracking-widest">
              Controle de Materiais & Ferramentas
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <span className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-50 text-gray-700 text-sm font-black uppercase tracking-[0.2em] rounded-full border border-gray-200">
              <Package size={20} /> Almoxarifado
            </span>
            <span className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-50 text-gray-700 text-sm font-black uppercase tracking-[0.2em] rounded-full border border-gray-200">
              <Users size={20} /> Oficinas
            </span>
          </div>
        </div>
      </header>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center space-x-6 transition-all hover:shadow-lg">
          <div className="p-5 rounded-3xl bg-blue-50 text-blue-600 border border-blue-100"><Users size={36} /></div>
          <div><p className="text-base font-black text-gray-400 uppercase tracking-widest">Alunos</p><p className="text-4xl font-black text-gray-900 leading-none mt-1">{students.length}</p></div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center space-x-6 transition-all hover:shadow-lg">
          <div className="p-5 rounded-3xl bg-green-50 text-green-600 border border-green-100"><Package size={36} /></div>
          <div><p className="text-base font-black text-gray-400 uppercase tracking-widest">Estoque</p><p className="text-4xl font-black text-gray-900 leading-none mt-1">{summary.reduce((acc, curr) => acc + curr.balance, 0)}</p></div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center space-x-6 transition-all hover:shadow-lg">
          <div className="p-5 rounded-3xl bg-purple-50 text-purple-600 border border-purple-100"><CheckCircle2 size={36} /></div>
          <div><p className="text-base font-black text-gray-400 uppercase tracking-widest">Entregues</p><p className="text-4xl font-black text-gray-900 leading-none mt-1">{totalEntregas}</p></div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center space-x-6 transition-all hover:shadow-lg">
          <div className="p-5 rounded-3xl bg-red-50 text-red-600 border border-red-100"><AlertCircle size={36} /></div>
          <div><p className="text-base font-black text-gray-400 uppercase tracking-widest">Críticos</p><p className="text-4xl font-black text-gray-900 leading-none mt-1">{itemsCriticos}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3 uppercase italic tracking-tighter"><TrendingDown size={28} className="text-orange-500" /> Alertas de Reposição</h3>
            <Link to="/planning" className="text-sm font-black text-gray-400 hover:text-red-600 uppercase tracking-[0.2em] transition-colors">Ver tudo</Link>
          </div>
          <div className="space-y-5">
            {summary.filter(s => s.toBuy > 0).slice(0, 5).map(item => (
              <div key={item.partId} className="flex justify-between items-center p-6 bg-gray-50 hover:bg-red-50/50 rounded-3xl border border-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 flex items-center justify-center bg-white rounded-2xl font-black text-xl text-gray-700 border border-gray-200">{item.partId}</div>
                  <div><p className="font-black text-xl text-gray-800 leading-tight">Peça {item.partId}</p><p className="text-sm text-gray-500 font-bold tracking-widest uppercase">{item.code}</p></div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-red-600 uppercase tracking-[0.2em]">Falta</p>
                  <p className="text-3xl font-black text-red-600 leading-none mt-1">{item.toBuy}</p>
                </div>
              </div>
            ))}
            {summary.filter(s => s.toBuy > 0).length === 0 && (
              <div className="p-16 text-center space-y-3 opacity-50">
                <CheckCircle2 size={56} className="mx-auto text-green-500" />
                <p className="font-black text-gray-400 uppercase tracking-[0.3em] text-lg">Tudo em ordem</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
          <h3 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3 uppercase italic tracking-tighter"><ArrowLeftRight size={28} className="text-blue-500" /> Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-6">
            <Link to="/withdrawals" className="group p-8 bg-blue-600 rounded-[2.5rem] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 text-center">
              <Users className="mx-auto mb-4 text-white transition-transform group-hover:scale-110" size={48} />
              <p className="text-white font-black uppercase tracking-[0.2em] text-sm">Entregar Peça</p>
            </Link>
            <Link to="/transactions" className="group p-8 bg-gray-900 rounded-[2.5rem] hover:bg-black transition-all shadow-xl shadow-gray-200 text-center">
              <Plus className="mx-auto mb-4 text-white transition-transform group-hover:scale-110" size={48} />
              <p className="text-white font-black uppercase tracking-[0.2em] text-sm">Lançar Entrada</p>
            </Link>
            <Link to="/stock" className="group p-8 bg-white border-2 border-gray-100 rounded-[2.5rem] hover:border-blue-500 hover:bg-blue-50 transition-all text-center">
              <Package className="mx-auto mb-4 text-gray-400 group-hover:text-blue-600 transition-transform group-hover:scale-110" size={48} />
              <p className="text-gray-400 group-hover:text-blue-600 font-black uppercase tracking-[0.2em] text-sm">Ver Inventário</p>
            </Link>
            <Link to="/planning" className="group p-8 bg-white border-2 border-gray-100 rounded-[2.5rem] hover:border-red-500 hover:bg-red-50 transition-all text-center">
              <TrendingDown className="mx-auto mb-4 text-gray-400 group-hover:text-red-600 transition-transform group-hover:scale-110" size={48} />
              <p className="text-gray-400 group-hover:text-red-600 font-black uppercase tracking-[0.2em] text-sm">Comprar Peças</p>
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
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div><h2 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">Checklist <span className="text-gray-400 not-italic">de Entrega</span></h2></div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
            <input type="text" placeholder="Buscar aluno..." className="w-full pl-12 pr-6 py-4 text-lg border-2 border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:border-red-500 transition-all outline-none font-bold" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="px-6 py-4 border-2 border-gray-100 rounded-2xl bg-gray-50 font-black text-lg outline-none focus:border-red-500 transition-all" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select>
        </div>
      </div>
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border overflow-x-auto min-h-[500px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-900 text-white">
            <tr><th className="p-8 border-r border-gray-800 sticky left-0 bg-gray-900 z-20 uppercase text-sm font-black tracking-[0.2em] whitespace-nowrap">Estudante</th>{parts.map(p => (<th key={p.id} className="p-4 text-center border-r border-gray-800 text-xs font-black min-w-[80px] uppercase tracking-tighter">{p.id}</th>))}</tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, idx) => (
              <tr key={student.id} className={`${idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'} border-b border-gray-100`}>
                <td className="p-6 border-r border-gray-200 font-black text-lg text-gray-700 whitespace-nowrap sticky left-0 bg-inherit z-10 shadow-sm">{student.name}</td>
                {parts.map(part => {
                  const active = isWithdrawn(student.id, part.id);
                  return (<td key={part.id} className={`p-4 border-r border-gray-100 text-center cursor-pointer transition-colors ${active ? 'bg-green-100/30' : 'hover:bg-red-50'}`} onClick={() => toggleWithdrawal(student.id, part.id)}>
                    <div className={`mx-auto h-12 w-12 rounded-2xl border-4 transition-all flex items-center justify-center ${active ? 'bg-green-500 border-green-600 shadow-xl shadow-green-200' : 'border-dashed border-gray-200 bg-white'}`}>{active && <CheckCircle2 size={28} className="text-white" />}</div>
                  </td>);
                })}
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr><td colSpan={parts.length + 1} className="p-32 text-center font-black text-gray-300 uppercase tracking-[0.3em] text-xl">Nenhum aluno encontrado</td></tr>
            )}
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100 gap-6">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Tarefas <span className="text-gray-400 not-italic">& Peças</span></h2>
        <button onClick={handleOpenAdd} className="bg-gray-900 text-white px-8 py-5 rounded-3xl font-black shadow-xl shadow-gray-200 flex items-center gap-3 transition-transform hover:scale-105 uppercase tracking-[0.2em] text-sm"><PlusCircle size={28} /> Nova Peça</button>
      </div>
      <div className="bg-white rounded-[3rem] shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-8 uppercase text-xs font-black tracking-[0.2em] text-gray-400">Tarefa</th>
              <th className="p-8 uppercase text-xs font-black tracking-[0.2em] text-gray-400">Código</th>
              <th className="p-8 text-center uppercase text-xs font-black tracking-[0.2em] text-gray-400">Meta</th>
              <th className="p-8 text-center uppercase text-xs font-black tracking-[0.2em] text-gray-400">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedParts.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-8 font-black text-xl text-gray-800">{p.id} - {p.name}</td>
                <td className="p-8 font-mono text-base text-blue-600 font-black">{p.code}</td>
                <td className="p-8 text-center font-black text-2xl text-gray-900 bg-gray-50/50">{p.targetQuantity}</td>
                <td className="p-8">
                  <div className="flex justify-center gap-4">
                    <button onClick={() => handleOpenEdit(p)} className="p-4 text-blue-600 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors"><Edit2 size={24} /></button>
                    <button onClick={() => onDelete(p.id)} className="p-4 text-red-600 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors"><Trash2 size={24} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPart ? "Editar Peça" : "Nova Peça"}>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData, !!editingPart); setIsModalOpen(false); }} className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2"><label className="text-xs font-black uppercase text-gray-400 tracking-[0.2em] ml-2">Tarefa (ID)</label><input type="text" placeholder="ex: T1" required disabled={!!editingPart} className="w-full p-5 border-2 border-gray-100 rounded-3xl bg-gray-50 outline-none focus:border-red-500 transition-all font-black text-xl" value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value.toUpperCase() })} /></div>
            <div className="space-y-2"><label className="text-xs font-black uppercase text-gray-400 tracking-[0.2em] ml-2">Meta Qtd</label><input type="number" placeholder="0" required className="w-full p-5 border-2 border-gray-100 rounded-3xl bg-gray-50 outline-none focus:border-red-500 transition-all font-black text-xl" value={formData.targetQuantity} onChange={e => setFormData({ ...formData, targetQuantity: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <div className="space-y-2"><label className="text-xs font-black uppercase text-gray-400 tracking-[0.2em] ml-2">Código SAP / Ref</label><input type="text" placeholder="Código de referência" className="w-full p-5 border-2 border-gray-100 rounded-3xl bg-gray-50 outline-none focus:border-red-500 transition-all font-black text-xl" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-xs font-black uppercase text-gray-400 tracking-[0.2em] ml-2">Descrição da Peça</label><input type="text" placeholder="Nome descritivo" required className="w-full p-5 border-2 border-gray-100 rounded-3xl bg-gray-50 outline-none focus:border-red-500 transition-all font-black text-xl" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
          <button type="submit" className="w-full bg-red-600 text-white font-black py-6 rounded-3xl shadow-2xl shadow-red-100 uppercase tracking-[0.3em] text-lg transition-all hover:bg-red-700 mt-4">Gravar Dados</button>
        </form>
      </Modal>
    </div>
  );
};

const StockInventory: React.FC<{ summary: StockSummary[] }> = ({ summary }) => (
  <div className="space-y-8">
    <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100">
      <h2 className="text-3xl font-black uppercase italic tracking-tighter">Estoque <span className="text-gray-400 not-italic">Consolidado</span></h2>
      <button onClick={() => window.print()} className="bg-gray-100 p-5 rounded-3xl hover:bg-gray-200 transition-colors text-gray-600"><Download size={32} /></button>
    </div>
    <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-900 text-white">
          <tr>
            <th className="p-8 uppercase text-xs font-black tracking-[0.2em]">Tarefa</th>
            <th className="p-8 text-center uppercase text-xs font-black tracking-[0.2em]">Entradas</th>
            <th className="p-8 text-center uppercase text-xs font-black tracking-[0.2em]">Saídas</th>
            <th className="p-8 text-center uppercase text-xs font-black tracking-[0.2em]">Alunos</th>
            <th className="p-8 text-center uppercase text-xs font-black tracking-[0.2em]">Saldo</th>
            <th className="p-8 text-center uppercase text-xs font-black tracking-[0.2em]">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {summary.map(item => (
            <tr key={item.partId} className="hover:bg-gray-50 transition-colors">
              <td className="p-8 font-black text-2xl text-gray-900">{item.partId}</td>
              <td className="p-8 text-center text-green-600 font-black text-xl">{item.entries}</td>
              <td className="p-8 text-center text-red-500 font-black text-xl">{item.exits}</td>
              <td className="p-8 text-center text-orange-500 font-black text-xl">{item.studentExits}</td>
              <td className={`p-8 text-center font-black text-3xl ${item.balance < 5 ? 'text-red-600 bg-red-50' : 'text-blue-700 bg-blue-50/30'}`}>{item.balance}</td>
              <td className="p-8 text-center">
                <span className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.2em] ${item.situation === 'OK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 border border-red-200'}`}>
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
  <div className="space-y-10">
    <div className="bg-gray-900 p-12 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 p-12 opacity-10"><TrendingDown size={180} /></div>
      <h2 className="text-5xl font-black uppercase italic tracking-tighter">Compra <span className="text-red-600">Necessária</span></h2>
      <p className="text-gray-400 font-bold max-w-lg mt-4 tracking-widest uppercase text-base">Análise de estoque baseada nas metas das turmas ativas.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {summary.filter(s => s.toBuy > 0).map(item => (
        <div key={item.partId} className="bg-white p-10 rounded-[3rem] shadow-sm border-t-[12px] border-red-600 flex justify-between items-center group transition-all hover:shadow-2xl hover:-translate-y-2">
          <div>
            <span className="text-5xl font-black text-gray-900 italic uppercase">{item.partId}</span>
            <p className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Cód: {item.code}</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-black text-red-500 block uppercase tracking-[0.2em] mb-2">Faltam</span>
            <span className="text-7xl font-black text-red-600 tabular-nums">{item.toBuy}</span>
          </div>
        </div>
      ))}
      {summary.filter(s => s.toBuy > 0).length === 0 && (
        <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-4 border-dashed border-gray-100">
           <Package size={80} className="mx-auto text-gray-200 mb-6" />
           <p className="font-black text-gray-400 uppercase tracking-[0.4em] text-2xl">Estoque 100% Suprido</p>
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
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Alunos <span className="text-gray-400 not-italic">& Turmas</span></h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <select className="px-6 py-4 border-2 border-gray-100 rounded-2xl bg-gray-50 font-black text-lg outline-none focus:border-blue-600 transition-all" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <button onClick={() => { setEditingId(null); setFormData({ name: '', class: selectedClass }); setIsModalOpen(true); }} className="bg-blue-600 text-white px-8 py-5 rounded-3xl font-black shadow-xl shadow-blue-100 flex items-center gap-3 uppercase tracking-[0.2em] text-sm"><UserPlus size={28} /> Cadastrar</button>
        </div>
      </div>
      <div className="bg-white rounded-[3rem] border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <tbody className="divide-y divide-gray-100">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-8 font-black text-xl text-gray-700">{s.name}</td>
                <td className="p-8 text-center">
                  <div className="flex justify-end gap-4">
                    <button onClick={() => { setEditingId(s.id); setFormData({ name: s.name, class: s.class }); setIsModalOpen(true); }} className="p-4 text-blue-600 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors"><Edit2 size={24} /></button>
                    <button onClick={() => onDelete(s.id)} className="p-4 text-red-600 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors"><Trash2 size={24} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={2} className="p-24 text-center text-gray-300 font-black uppercase tracking-[0.3em] text-xl">Nenhum aluno cadastrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Aluno" : "Novo Aluno"}>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData, editingId || undefined); setIsModalOpen(false); }} className="space-y-8">
          <div className="space-y-2"><label className="text-xs font-black uppercase text-gray-400 tracking-[0.2em] ml-2">Nome Completo</label><input type="text" placeholder="Nome do estudante" required className="w-full p-6 border-2 border-gray-100 rounded-3xl bg-gray-50 outline-none focus:border-blue-600 transition-all font-black text-xl" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-xs font-black uppercase text-gray-400 tracking-[0.2em] ml-2">Turma Atribuída</label><select className="w-full p-6 border-2 border-gray-100 rounded-3xl bg-gray-50 font-black text-xl outline-none focus:border-blue-600 transition-all" value={formData.class} onChange={e => setFormData({ ...formData, class: e.target.value })}>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <button type="submit" className="w-full bg-blue-600 text-white font-black py-6 rounded-3xl shadow-2xl shadow-blue-100 uppercase tracking-[0.3em] text-lg transition-all hover:bg-blue-700 mt-4">Confirmar Cadastro</button>
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
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Fluxo <span className="text-gray-400 not-italic">de Estoque</span></h2>
        <button onClick={() => setShowAdd(!showAdd)} className={`p-6 rounded-3xl font-black transition-all flex items-center gap-3 uppercase tracking-[0.2em] text-sm ${showAdd ? 'bg-gray-100 text-gray-600' : 'bg-gray-900 text-white shadow-2xl shadow-gray-200'}`}>{showAdd ? <X size={28} /> : <Plus size={28} />}</button>
      </div>
      {showAdd && (
        <form onSubmit={(e) => { e.preventDefault(); addTransaction(formData); setShowAdd(false); }} className="bg-white p-10 rounded-[3rem] border-4 border-gray-900 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end animate-in slide-in-from-top-4 shadow-2xl">
          <div className="space-y-2"><label className="text-xs font-black uppercase text-gray-400 tracking-[0.2em]">Data</label><input type="date" required className="w-full p-4 border-2 border-gray-100 rounded-2xl bg-gray-50 font-black text-lg" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-xs font-black uppercase text-gray-400 tracking-[0.2em]">Tipo</label><select className="w-full p-4 border-2 border-gray-100 rounded-2xl bg-gray-50 font-black text-lg" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as TransactionType })}><option value={TransactionType.ENTRY}>Entrada (+)</option><option value={TransactionType.EXIT}>Saída (-)</option></select></div>
          <div className="space-y-2"><label className="text-xs font-black uppercase text-gray-400 tracking-[0.2em]">Referência</label><input type="text" placeholder="NF, Memorando..." required className="w-full p-4 border-2 border-gray-100 rounded-2xl bg-gray-50 font-black text-lg" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-xs font-black uppercase text-gray-400 tracking-[0.2em]">Tarefa</label><select className="w-full p-4 border-2 border-gray-100 rounded-2xl bg-gray-50 font-black text-lg" value={formData.partId} onChange={e => setFormData({ ...formData, partId: e.target.value })}>{parts.map(p => <option key={p.id} value={p.id}>{p.id} - {p.name}</option>)}</select></div>
          <div className="flex gap-4">
            <div className="space-y-2 flex-1"><label className="text-xs font-black uppercase text-gray-400 tracking-[0.2em]">Qtd</label><input type="number" required className="w-full p-4 border-2 border-gray-100 rounded-2xl bg-gray-50 font-black text-lg" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} /></div>
            <button type="submit" className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-green-100 transition-all hover:bg-green-700 text-lg">Lançar</button>
          </div>
        </form>
      )}
      <div className="bg-white rounded-[3rem] shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b uppercase text-xs font-black text-gray-400 tracking-[0.2em]">
            <tr>
              <th className="p-8">Data</th>
              <th className="p-8">Tipo</th>
              <th className="p-8">Tarefa</th>
              <th className="p-8 text-right">Qtd</th>
              <th className="p-8 text-center">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[...transactions].reverse().map(t => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-8 text-sm font-bold text-gray-400">{formatDate(t.date)}</td>
                <td className="p-8">
                  <span className={`px-5 py-2 rounded-full text-xs font-black tracking-widest ${t.type === TransactionType.ENTRY ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {t.type}
                  </span>
                </td>
                <td className="p-8 font-black text-xl text-gray-900">{t.partId}</td>
                <td className="p-8 text-right font-mono font-black text-2xl">{t.quantity}</td>
                <td className="p-8 text-center">
                  <button onClick={() => deleteTransaction(t.id)} className="text-gray-300 hover:text-red-600 p-4 transition-colors bg-gray-50 rounded-2xl">
                    <Trash2 size={24} />
                  </button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr><td colSpan={5} className="p-32 text-center font-black text-gray-200 uppercase tracking-[0.4em] text-xl">Nenhum registro encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
