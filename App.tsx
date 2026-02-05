
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

const SenaiLogo: React.FC<{ className?: string; sizeClass?: string }> = ({ className = "", sizeClass = "text-2xl" }) => (
  <div className={`flex items-center select-none ${className}`}>
    <span className={`text-red-600 font-[900] ${sizeClass} tracking-tighter italic leading-none`}>SENAI</span>
  </div>
);

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-300">
    <div className="text-center">
      <Loader2 className="w-10 h-10 text-red-600 animate-spin mx-auto mb-2" />
      <p className="text-gray-700 text-sm font-bold animate-pulse">Carregando Nuvem...</p>
    </div>
  </div>
);

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="text-lg font-black text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1"><X size={20} /></button>
        </div>
        <div className="p-4">{children}</div>
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs overflow-hidden animate-in zoom-in-95 duration-200 border border-red-100 p-5 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 mb-3"><TriangleAlert className="h-5 w-5 text-red-600" /></div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-xs text-gray-500 mb-5">{message}</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm">Não</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 px-3 py-2 bg-red-600 text-white font-bold rounded-lg shadow-lg text-sm">Sim, Excluir</button>
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
        setStudents(s || []);
        setParts(p || []);
        setTransactions(t || []);
        setWithdrawals(w || []);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
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
    } catch (err) {
      console.error("Erro na sincronização:", err);
      alert("Erro ao salvar no banco de dados. Verifique a conexão.");
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
      message: "Deseja excluir este registro?",
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
        partId: part.id, code: part.code, name: part.name, entries, exits, studentExits, balance, 
        situation: balance >= part.targetQuantity ? 'OK' : 'COMPRAR', 
        toBuy: Math.max(0, part.targetQuantity - balance) 
      } as StockSummary;
    });
  }, [transactions, withdrawals, parts]);

  if (loading) return <LoadingOverlay />;

  return (
    <Router>
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
        <aside className="hidden md:flex flex-col w-52 bg-gray-900 h-screen sticky top-0 shadow-2xl z-50">
          <div className="p-4 border-b border-gray-800 bg-gray-950 flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <SenaiLogo sizeClass="text-xl" />
              <div className="flex flex-col">
                <h1 className="text-white font-black text-sm tracking-tight uppercase leading-none">Mecânico</h1>
                <span className="text-gray-500 font-bold text-[8px] tracking-widest uppercase mt-0.5">Usinagem</span>
              </div>
            </div>
            <div>
              {syncing ? <Loader2 className="w-3 h-3 text-gray-400 animate-spin" /> : <div className="w-2 h-2 rounded-full bg-green-500" />}
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1.5 mt-2 overflow-y-auto">
            <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Início" />
            <div className="px-2 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest">Estoque</div>
            <NavItem to="/withdrawals" icon={<Users size={18} />} label="Entregar" />
            <NavItem to="/transactions" icon={<ArrowLeftRight size={18} />} label="Entradas" />
            <NavItem to="/stock" icon={<Package size={18} />} label="Saldos" />
            <NavItem to="/planning" icon={<TrendingDown size={18} />} label="Compras" />
            <div className="px-2 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest">Ajustes</div>
            <NavItem to="/parts" icon={<Settings size={18} />} label="Peças" />
            <NavItem to="/students" icon={<UserPlus size={18} />} label="Alunos" />
          </nav>
        </aside>

        <main className="flex-1 p-3 md:p-5 pb-20 min-w-0">
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

        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around p-2 z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          <MobileNavItem to="/" icon={<LayoutDashboard size={20} />} />
          <MobileNavItem to="/withdrawals" icon={<Users size={20} />} />
          <MobileNavItem to="/transactions" icon={<ArrowLeftRight size={20} />} />
          <MobileNavItem to="/stock" icon={<Package size={20} />} />
        </nav>
      </div>
    </Router>
  );
};

const NavItem: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (<Link to={to} className={`flex items-center space-x-2.5 p-2.5 rounded-lg transition-all ${active ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`}>{icon}<span className="font-bold text-xs">{label}</span></Link>);
};

const MobileNavItem: React.FC<{ to: string, icon: React.ReactNode }> = ({ to, icon }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (<Link to={to} className={`p-2.5 rounded-xl transition-all ${active ? 'bg-gray-100 text-red-600' : 'text-gray-400'}`}>{icon}</Link>);
};

const Dashboard: React.FC<{ summary: StockSummary[], students: Student[] }> = ({ summary, students }) => {
  const itemsCriticos = summary.filter(s => s.balance < (s.entries * 0.1)).length;
  const totalEntregas = summary.reduce((acc, curr) => acc + curr.studentExits, 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <header className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 md:gap-6">
        <SenaiLogo sizeClass="text-4xl md:text-5xl" />
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-xl font-black text-gray-900 leading-tight uppercase tracking-tight truncate italic">Usinagem Convencional</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Controle Almoxarifado</p>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Users size={20} />} label="Alunos" value={students.length} color="blue" />
        <StatCard icon={<Package size={20} />} label="Estoque" value={summary.reduce((acc, curr) => acc + curr.balance, 0)} color="green" />
        <StatCard icon={<CheckCircle2 size={20} />} label="Entregues" value={totalEntregas} color="purple" />
        <StatCard icon={<AlertCircle size={20} />} label="Críticos" value={itemsCriticos} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-black text-gray-800 flex items-center gap-2 uppercase tracking-tighter italic">Compras Urgentes</h3>
            <Link to="/planning" className="text-[9px] font-black text-gray-400 hover:text-red-600 uppercase tracking-widest">Ver Mais</Link>
          </div>
          <div className="space-y-2">
            {summary.filter(s => s.toBuy > 0).slice(0, 3).map(item => (
              <div key={item.partId} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 flex items-center justify-center bg-white rounded-md font-black text-xs text-gray-700 border border-gray-200">{item.partId}</div>
                  <span className="font-bold text-xs text-gray-800 truncate max-w-[120px]">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-red-600 uppercase">Falta</span>
                  <p className="text-base font-black text-red-600 leading-none">{item.toBuy}</p>
                </div>
              </div>
            ))}
            {summary.filter(s => s.toBuy > 0).length === 0 && <p className="text-center py-4 text-xs font-bold text-gray-300 uppercase">Estoque OK</p>}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-black text-gray-800 mb-3 uppercase tracking-tighter italic">Acesso Rápido</h3>
          <div className="grid grid-cols-2 gap-2">
            <QuickAction to="/withdrawals" icon={<Users size={20} />} label="Entrega" color="blue" />
            <QuickAction to="/transactions" icon={<Plus size={20} />} label="Entrada" color="gray" />
            <QuickAction to="/stock" icon={<Package size={20} />} label="Saldo" color="white" />
            <QuickAction to="/planning" icon={<TrendingDown size={20} />} label="Compras" color="white" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: any) => {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    red: "bg-red-50 text-red-600 border-red-100"
  };
  return (
    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
      <div className={`p-2 rounded-lg ${colors[color]} border`}>{icon}</div>
      <div>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">{label}</p>
        <p className="text-lg font-black text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
};

const QuickAction = ({ to, icon, label, color }: any) => {
  const themes: any = {
    blue: "bg-blue-600 text-white shadow-blue-100",
    gray: "bg-gray-900 text-white shadow-gray-200",
    white: "bg-white border-2 border-gray-100 text-gray-400"
  };
  return (
    <Link to={to} className={`p-3 rounded-xl transition-all shadow-sm text-center flex flex-col items-center justify-center ${themes[color]}`}>
      {icon}
      <p className={`font-black uppercase tracking-widest text-[8px] mt-1.5 ${color === 'white' ? 'text-gray-500' : ''}`}>{label}</p>
    </Link>
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
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
        <h2 className="text-base font-black text-gray-800 uppercase italic">Checklist Entrega</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Aluno..." className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg bg-gray-50 font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="px-2 py-1.5 border rounded-lg bg-gray-50 font-black text-[10px] outline-none" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto min-h-[350px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-900 text-white">
            <tr><th className="p-3 border-r border-gray-800 sticky left-0 bg-gray-900 z-20 uppercase text-[9px] font-black tracking-widest">Estudante</th>{parts.map(p => (<th key={p.id} className="p-1.5 text-center border-r border-gray-800 text-[8px] font-black min-w-[50px] uppercase">{p.id}</th>))}</tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, idx) => (
              <tr key={student.id} className={`${idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'} border-b`}>
                <td className="p-2.5 border-r border-gray-100 font-bold text-xs text-gray-700 whitespace-nowrap sticky left-0 bg-inherit z-10">{student.name}</td>
                {parts.map(part => {
                  const active = isWithdrawn(student.id, part.id);
                  return (<td key={part.id} className={`p-1.5 border-r text-center cursor-pointer transition-colors ${active ? 'bg-green-50/30' : 'hover:bg-red-50'}`} onClick={() => toggleWithdrawal(student.id, part.id)}>
                    <div className={`mx-auto h-6 w-6 rounded-md border-2 transition-all flex items-center justify-center ${active ? 'bg-green-500 border-green-600' : 'border-dashed border-gray-200 bg-white'}`}>{active && <CheckCircle2 size={14} className="text-white" />}</div>
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
  const handleOpenAdd = () => { setEditingPart(null); setFormData({ id: '', code: '', name: '', targetQuantity: 0 }); setIsModalOpen(true); };
  const handleOpenEdit = (p: Part) => { setEditingPart(p); setFormData({ ...p }); setIsModalOpen(true); };
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100">
        <h2 className="text-base font-black italic uppercase">Tarefas do Curso</h2>
        <button onClick={handleOpenAdd} className="bg-gray-900 text-white px-3 py-2 rounded-lg font-black uppercase text-[10px] flex items-center gap-2"><Plus size={16} /> Nova</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-[9px] uppercase font-black text-gray-400">
            <tr><th className="p-3">Tarefa</th><th className="p-3">Meta</th><th className="p-3 text-center">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {parts.sort((a,b) => sortTaskIds(a.id, b.id)).map(p => (
              <tr key={p.id} className="hover:bg-gray-50 text-xs">
                <td className="p-3 font-black text-gray-800">{p.id} - {p.name}</td>
                <td className="p-3 font-black text-gray-900">{p.targetQuantity}</td>
                <td className="p-3">
                  <div className="flex justify-center gap-1.5">
                    <button onClick={() => handleOpenEdit(p)} className="p-1.5 text-blue-600 bg-blue-50 rounded-md"><Edit2 size={14} /></button>
                    <button onClick={() => onDelete(p.id)} className="p-1.5 text-red-600 bg-red-50 rounded-md"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPart ? "Editar Peça" : "Nova Peça"}>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData, !!editingPart); setIsModalOpen(false); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">ID (ex: T1)</label><input type="text" required disabled={!!editingPart} className="w-full p-2 border rounded-lg bg-gray-50 font-black text-xs uppercase" value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value.toUpperCase() })} /></div>
            <div className="space-y-1"><label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Meta</label><input type="number" required className="w-full p-2 border rounded-lg bg-gray-50 font-black text-xs" value={formData.targetQuantity} onChange={e => setFormData({ ...formData, targetQuantity: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <div className="space-y-1"><label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Nome da Peça</label><input type="text" required className="w-full p-2 border rounded-lg bg-gray-50 font-black text-xs" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
          <button type="submit" className="w-full bg-red-600 text-white font-black py-3 rounded-lg uppercase text-xs">Salvar</button>
        </form>
      </Modal>
    </div>
  );
};

const StockInventory: React.FC<{ summary: StockSummary[] }> = ({ summary }) => (
  <div className="space-y-4">
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-base font-black uppercase italic">Inventário de Peças</h2>
    </div>
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-900 text-white text-[9px] uppercase font-black">
          <tr><th className="p-3">Tarefa</th><th className="p-3 text-center">E</th><th className="p-3 text-center">S</th><th className="p-3 text-center">Saldo</th><th className="p-3 text-center">Status</th></tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {summary.map(item => (
            <tr key={item.partId} className="hover:bg-gray-50 text-xs font-bold">
              <td className="p-3 text-gray-900">{item.partId}</td>
              <td className="p-3 text-center text-green-600">{item.entries}</td>
              <td className="p-3 text-center text-red-500">{item.exits + item.studentExits}</td>
              <td className={`p-3 text-center font-black ${item.balance < 5 ? 'text-red-600 bg-red-50' : 'text-blue-700'}`}>{item.balance}</td>
              <td className="p-3 text-center">
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${item.situation === 'OK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 border border-red-200'}`}>
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
  <div className="space-y-4">
    <div className="bg-gray-900 p-6 rounded-2xl text-white">
      <h2 className="text-xl font-black uppercase italic">Previsão de Compra</h2>
      <p className="text-gray-400 font-bold text-[9px] uppercase tracking-widest mt-1">Baseado na meta de peças por aluno.</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {summary.filter(s => s.toBuy > 0).map(item => (
        <div key={item.partId} className="bg-white p-4 rounded-xl border-t-4 border-red-600 shadow-sm flex justify-between items-center">
          <div><span className="text-2xl font-black text-gray-900 italic uppercase">{item.partId}</span></div>
          <div className="text-right">
            <span className="text-[8px] font-black text-red-500 block uppercase">Falta</span>
            <span className="text-2xl font-black text-red-600">{item.toBuy}</span>
          </div>
        </div>
      ))}
      {summary.filter(s => s.toBuy > 0).length === 0 && <p className="col-span-full py-10 text-center font-black text-gray-300 uppercase text-xs">Nenhuma compra necessária</p>}
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
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center gap-2">
        <h2 className="text-base font-black italic uppercase">Gestão de Alunos</h2>
        <div className="flex gap-2">
          <select className="px-2 py-1.5 border rounded-lg bg-gray-50 font-black text-[9px] outline-none" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <button onClick={() => { setEditingId(null); setFormData({ name: '', class: selectedClass }); setIsModalOpen(true); }} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-black uppercase text-[9px] flex items-center gap-1.5"><UserPlus size={14} /> Novo</button>
        </div>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <tbody className="divide-y divide-gray-100">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 text-xs">
                <td className="p-3 font-black text-gray-700">{s.name}</td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => { setEditingId(s.id); setFormData({ name: s.name, class: s.class }); setIsModalOpen(true); }} className="p-1.5 text-blue-600 bg-blue-50 rounded-md"><Edit2 size={12} /></button>
                    <button onClick={() => onDelete(s.id)} className="p-1.5 text-red-600 bg-red-50 rounded-md"><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Aluno" : "Novo Aluno"}>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData, editingId || undefined); setIsModalOpen(false); }} className="space-y-4">
          <div className="space-y-1"><label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Nome</label><input type="text" required className="w-full p-2 border rounded-lg font-black text-xs" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
          <div className="space-y-1"><label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Turma</label><select className="w-full p-2 border rounded-lg font-black text-xs" value={formData.class} onChange={e => setFormData({ ...formData, class: e.target.value })}>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <button type="submit" className="w-full bg-blue-600 text-white font-black py-3 rounded-lg uppercase text-xs">Confirmar</button>
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
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100">
        <h2 className="text-base font-black italic uppercase">Entradas de Peças</h2>
        <button onClick={() => setShowAdd(!showAdd)} className={`p-2 rounded-lg font-black uppercase text-[9px] ${showAdd ? 'bg-gray-100' : 'bg-gray-900 text-white'}`}>{showAdd ? <X size={16} /> : <Plus size={16} />}</button>
      </div>
      {showAdd && (
        <form onSubmit={(e) => { e.preventDefault(); addTransaction(formData); setShowAdd(false); }} className="bg-white p-4 rounded-xl border-2 border-gray-900 grid grid-cols-1 sm:grid-cols-2 gap-3 items-end animate-in slide-in-from-top-4 shadow-xl">
          <div className="space-y-1"><label className="text-[9px] font-black uppercase text-gray-400">Data</label><input type="date" required className="w-full p-2 border rounded-lg font-black text-xs" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} /></div>
          <div className="space-y-1"><label className="text-[9px] font-black uppercase text-gray-400">Tipo</label><select className="w-full p-2 border rounded-lg font-black text-xs" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as TransactionType })}><option value={TransactionType.ENTRY}>Entrada</option><option value={TransactionType.EXIT}>Saída</option></select></div>
          <div className="space-y-1"><label className="text-[9px] font-black uppercase text-gray-400">Ref (NF)</label><input type="text" required className="w-full p-2 border rounded-lg font-black text-xs" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
          <div className="space-y-1"><label className="text-[9px] font-black uppercase text-gray-400">Tarefa</label><select className="w-full p-2 border rounded-lg font-black text-xs" value={formData.partId} onChange={e => setFormData({ ...formData, partId: e.target.value })}>{parts.map(p => <option key={p.id} value={p.id}>{p.id} - {p.name}</option>)}</select></div>
          <div className="flex gap-2">
            <div className="space-y-1 flex-1"><label className="text-[9px] font-black uppercase text-gray-400">Qtd</label><input type="number" required className="w-full p-2 border rounded-lg font-black text-xs" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} /></div>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg font-black text-xs">OK</button>
          </div>
        </form>
      )}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b uppercase text-[8px] font-black text-gray-400">
            <tr><th className="p-3">Data</th><th className="p-3 text-center">Tipo</th><th className="p-3">Tarefa</th><th className="p-3 text-right">Qtd</th><th className="p-3 text-center">Ação</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[...transactions].reverse().map(t => (
              <tr key={t.id} className="hover:bg-gray-50 text-[11px] font-bold">
                <td className="p-3 text-gray-400 font-normal">{formatDate(t.date)}</td>
                <td className="p-3 text-center">
                  <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${t.type === TransactionType.ENTRY ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {t.type}
                  </span>
                </td>
                <td className="p-3 text-gray-900">{t.partId}</td>
                <td className="p-3 text-right font-mono">{t.quantity}</td>
                <td className="p-3 text-center"><button onClick={() => deleteTransaction(t.id)} className="text-gray-300 hover:text-red-600"><Trash2 size={12} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
