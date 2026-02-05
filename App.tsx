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
import { generateId } from './utils';
import { db } from './dataService';

// --- Utilitários de Ordenação ---
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
  <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-600 font-bold animate-pulse">Sincronizando dados...</p>
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center border border-red-100">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4"><TriangleAlert className="h-6 w-6 text-red-600" /></div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl">Cancelar</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-xl shadow-lg">Confirmar</button>
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
        setStudents(s || []);
        setParts(p || []);
        setTransactions(t || []);
        setWithdrawals(w || []);
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
      message: `Remover a peça ${id} permanentemente?`,
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

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 z-[100] shadow-lg">
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
  const itemsCriticos = summary.filter(s => s.balance < 5).length;
  const totalEntregas = summary.reduce((acc, curr) => acc + curr.studentExits, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-shrink-0">
          <div className="relative p-6 bg-red-600 rounded-2xl shadow-lg">
            <div className="flex items-center justify-center">
               <img src="https://upload.wikimedia.org/wikipedia/commons/8/8c/SENAI_Logo.svg" alt="SENAI Logo" className="h-12 w-auto brightness-0 invert" />
            </div>
          </div>
        </div>
        <div className="text-center md:text-left flex-1 space-y-3">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">Mecânico de Usinagem Convencional</h2>
          <p className="text-lg font-bold text-gray-500 uppercase">Controle de Estoque e Entrega de Peças</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users />} label="Alunos" value={students.length} color="blue" />
        <StatCard icon={<Package />} label="Estoque Total" value={summary.reduce((acc, curr) => acc + curr.balance, 0)} color="green" />
        <StatCard icon={<CheckCircle2 />} label="Entregues" value={totalEntregas} color="purple" />
        <StatCard icon={<AlertCircle />} label="Críticos" value={itemsCriticos} color="red" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
           <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2 uppercase italic tracking-tighter"><TrendingDown size={22} className="text-orange-500" /> Alertas de Reposição</h3>
           <div className="space-y-4">
            {summary.filter(s => s.toBuy > 0).slice(0, 5).map(item => (
              <div key={item.partId} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center bg-white rounded-xl font-black text-red-600 border border-red-100">{item.partId}</div>
                  <div><p className="font-bold text-gray-700">Peça {item.partId}</p><p className="text-xs text-gray-400">Cód: {item.code}</p></div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-red-600 uppercase">Falta</p>
                  <p className="text-xl font-black text-red-600">{item.toBuy}</p>
                </div>
              </div>
            ))}
           </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-800 mb-6 uppercase italic tracking-tighter">Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-4">
             <QuickActionLink to="/withdrawals" icon={<Users />} label="Entregar Peça" color="bg-blue-600" />
             <QuickActionLink to="/transactions" icon={<Plus />} label="Lançar Entrada" color="bg-gray-900" />
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
    <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-5 transition-all hover:shadow-md">
      <div className={`p-4 rounded-2xl border ${colors[color]}`}>{React.cloneElement(icon, { size: 28 })}</div>
      <div><p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{label}</p><p className="text-3xl font-black text-gray-900">{value}</p></div>
    </div>
  );
};

const QuickActionLink = ({ to, icon, label, color }: any) => (
  <Link to={to} className={`group p-6 ${color} rounded-2xl hover:opacity-90 transition-all shadow-lg text-center`}>
    <div className="text-white mb-3 flex justify-center">{React.cloneElement(icon, { size: 32 })}</div>
    <p className="text-white font-black uppercase tracking-widest text-xs">{label}</p>
  </Link>
);

const MaterialWithdrawals: React.FC<{
  withdrawals: StudentWithdrawal[];
  toggleWithdrawal: (sid: string, pid: string) => void;
  students: Student[];
  parts: Part[];
}> = ({ withdrawals, toggleWithdrawal, students, parts }) => {
  const [selectedClass, setSelectedClass] = useState(CLASSES[3]);
  const [searchTerm, setSearchTerm] = useState('');
  const filteredStudents = useMemo(() => students.filter(s => s.class === selectedClass && s.name.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => sortAlphabetically(a.name, b.name)), [students, selectedClass, searchTerm]);
  const isWithdrawn = (sid: string, pid: string) => withdrawals.some(w => w.studentId === sid && w.partId === pid);
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-black text-gray-800 uppercase italic tracking-tighter">Checklist de Entrega</h2>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Buscar aluno..." className="pl-10 pr-4 py-2.5 border-2 border-gray-50 rounded-2xl bg-gray-50 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="p-2.5 border-2 border-gray-50 rounded-2xl bg-gray-50 font-bold" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="bg-white rounded-[2rem] shadow-xl border overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="p-5 border-r border-gray-800 sticky left-0 bg-gray-900 z-20">Estudante</th>
              {parts.map(p => (<th key={p.id} className="p-3 text-center border-r border-gray-800 text-[10px] font-black">{p.id}</th>))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, idx) => (
              <tr key={student.id} className={idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                <td className="p-4 border-r border-gray-200 font-bold text-sm whitespace-nowrap sticky left-0 bg-inherit z-10">{student.name}</td>
                {parts.map(part => {
                  const active = isWithdrawn(student.id, part.id);
                  return (
                    <td key={part.id} className={`p-2 border-r border-gray-100 text-center cursor-pointer ${active ? 'bg-green-100/30' : ''}`} onClick={() => toggleWithdrawal(student.id, part.id)}>
                      <div className={`mx-auto h-7 w-7 rounded-xl border-2 flex items-center justify-center transition-all ${active ? 'bg-green-500 border-green-600 text-white' : 'border-dashed border-gray-300'}`}>
                        {active && <CheckCircle2 size={16} />}
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
  const sortedParts = useMemo(() => [...parts].sort((a, b) => sortTaskIds(a.id, b.id)), [parts]);

  const handleOpenAdd = () => { setEditingPart(null); setFormData({ id: '', code: '', name: '', targetQuantity: 0 }); setIsModalOpen(true); };
  const handleOpenEdit = (p: Part) => { setEditingPart(p); setFormData({ ...p }); setIsModalOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100">
        <h2 className="text-2xl font-black italic uppercase">Tarefas & Códigos</h2>
        <button onClick={handleOpenAdd} className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg flex items-center gap-2"><PlusCircle size={20} /> Nova Peça</button>
      </div>
      <div className="bg-white rounded-[2rem] shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-5 uppercase text-[10px] font-black text-gray-400">Tarefa</th>
              <th className="p-5 uppercase text-[10px] font-black text-gray-400">Código</th>
              <th className="p-5 text-center uppercase text-[10px] font-black text-gray-400">Meta</th>
              <th className="p-5 text-center uppercase text-[10px] font-black text-gray-400">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedParts.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 border-b last:border-0">
                <td className="p-5 font-black text-gray-800">{p.id} - {p.name}</td>
                <td className="p-5 font-mono text-xs text-blue-600 font-bold">{p.code}</td>
                <td className="p-5 text-center font-black text-gray-900 bg-gray-50/50">{p.targetQuantity}</td>
                <td className="p-5 text-center">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => handleOpenEdit(p)} className="p-2 text-blue-600 bg-blue-50 rounded-xl"><Edit2 size={16} /></button>
                    <button onClick={() => onDelete(p.id)} className="p-2 text-red-600 bg-red-50 rounded-xl"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPart ? "Editar Peça" : "Nova Peça"}>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData, !!editingPart); setIsModalOpen(false); }} className="space-y-4">
          <input type="text" placeholder="ID (ex: T1)" disabled={!!editingPart} className="w-full p-4 border rounded-2xl" value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value.toUpperCase() })} />
          <input type="text" placeholder="Nome da Peça" className="w-full p-4 border rounded-2xl" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          <input type="text" placeholder="Código" className="w-full p-4 border rounded-2xl" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
          <input type="number" placeholder="Meta" className="w-full p-4 border rounded-2xl" value={formData.targetQuantity} onChange={e => setFormData({ ...formData, targetQuantity: parseInt(e.target.value) || 0 })} />
          <button type="submit" className="w-full bg-red-600 text-white font-black py-4 rounded-2xl">Salvar</button>
        </form>
      </Modal>
    </div>
  );
};

const StockInventory: React.FC<{ summary: StockSummary[] }> = ({ summary }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100">
      <h2 className="text-2xl font-black uppercase italic tracking-tighter">Estoque Consolidado</h2>
      <button onClick={() => window.print()} className="bg-gray-100 p-3 rounded-2xl"><Download size={22} /></button>
    </div>
    <div className="bg-white rounded-[2rem] shadow-xl border overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-900 text-white">
          <tr>
            <th className="p-5 uppercase text-[10px] font-black">Tarefa</th>
            <th className="p-5 text-center uppercase text-[10px] font-black">Entradas</th>
            <th className="p-5 text-center uppercase text-[10px] font-black">Saídas</th>
            <th className="p-5 text-center uppercase text-[10px] font-black">Entregues</th>
            <th className="p-5 text-center uppercase text-[10px] font-black">Saldo</th>
            <th className="p-5 text-center uppercase text-[10px] font-black">Status</th>
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
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${item.situation === 'OK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
    <h2 className="text-2xl font-black uppercase italic">Planejamento de Compras</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {summary.filter(s => s.toBuy > 0).map(item => (
        <div key={item.partId} className="bg-white p-6 rounded-[2rem] border-2 border-red-50 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="h-12 w-12 flex items-center justify-center bg-red-600 text-white rounded-2xl font-black text-xl">{item.partId}</span>
            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-black uppercase">Crítico</span>
          </div>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Cód: {item.code}</p>
          <h3 className="text-xl font-black text-gray-900 mb-6">Necessário: <span className="text-red-600">{item.toBuy} unidades</span></h3>
          <div className="pt-4 border-t border-gray-100 text-xs font-bold text-gray-500 uppercase italic">Aguardando reposição</div>
        </div>
      ))}
    </div>
  </div>
);

const Transactions: React.FC<{ 
  transactions: Transaction[], 
  addTransaction: (t: Omit<Transaction, 'id'>) => void,
  deleteTransaction: (id: string) => void,
  parts: Part[] 
}> = ({ transactions, addTransaction, deleteTransaction, parts }) => {
  const [formData, setFormData] = useState({ partId: '', quantity: 0, type: TransactionType.ENTRY });
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <h3 className="text-xl font-black uppercase italic mb-6">Lançar Movimentação</h3>
        <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={(e) => {
          e.preventDefault();
          if(!formData.partId) return;
          addTransaction({ ...formData, date: new Date().toISOString() });
          setFormData({ partId: '', quantity: 0, type: TransactionType.ENTRY });
        }}>
          <select className="p-4 border rounded-2xl font-bold bg-gray-50" value={formData.partId} onChange={e => setFormData({...formData, partId: e.target.value})}>
            <option value="">Selecione a Peça</option>
            {parts.map(p => <option key={p.id} value={p.id}>{p.id} - {p.name}</option>)}
          </select>
          <input type="number" placeholder="Qtd" className="p-4 border rounded-2xl font-bold" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} />
          <select className="p-4 border rounded-2xl font-bold" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as TransactionType})}>
            <option value={TransactionType.ENTRY}>Entrada (+)</option>
            <option value={TransactionType.EXIT}>Saída (-)</option>
          </select>
          <button type="submit" className="bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all">Lançar</button>
        </form>
      </div>

      <div className="bg-white rounded-[2rem] border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-5 uppercase text-[10px] font-black">Data</th>
              <th className="p-5 uppercase text-[10px] font-black">Peça</th>
              <th className="p-5 uppercase text-[10px] font-black">Tipo</th>
              <th className="p-5 text-center uppercase text-[10px] font-black">Qtd</th>
              <th className="p-5 text-center uppercase text-[10px] font-black">Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice().reverse().map(t => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <td className="p-5 text-sm text-gray-500 font-medium">{new Date(t.date).toLocaleDateString()}</td>
                <td className="p-5 font-black text-gray-800">{t.partId}</td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${t.type === TransactionType.ENTRY ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {t.type === TransactionType.ENTRY ? 'Entrada' : 'Saída'}
                  </span>
                </td>
                <td className="p-5 text-center font-bold">{t.quantity}</td>
                <td className="p-5 text-center">
                  <button onClick={() => deleteTransaction(t.id)} className="p-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-100"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StudentsManager: React.FC<{ 
  students: Student[], 
  onSave: (s: Omit<Student, 'id'>, id?: string) => void, 
  onDelete: (id: string) => void 
}> = ({ students, onSave, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ name: '', class: CLASSES[0] });

  const handleOpenAdd = () => { setEditingStudent(null); setFormData({ name: '', class: CLASSES[0] }); setIsModalOpen(true); };
  const handleOpenEdit = (s: Student) => { setEditingStudent(s); setFormData({ name: s.name, class: s.class }); setIsModalOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100">
        <h2 className="text-2xl font-black italic uppercase">Alunos & Turmas</h2>
        <button onClick={handleOpenAdd} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg flex items-center gap-2"><UserPlus size={20} /> Novo Aluno</button>
      </div>
      <div className="bg-white rounded-[2rem] shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-5 uppercase text-[10px] font-black text-gray-400 tracking-widest">Nome do Aluno</th>
              <th className="p-5 uppercase text-[10px] font-black text-gray-400 tracking-widest">Turma</th>
              <th className="p-5 text-center uppercase text-[10px] font-black text-gray-400 tracking-widest">Ações</th>
            </tr>
          </thead>
          <tbody>
            {students.sort((a,b) => sortAlphabetically(a.name, b.name)).map(s => (
              <tr key={s.id} className="hover:bg-gray-50 border-t">
                <td className="p-5 font-black text-gray-800">{s.name}</td>
                <td className="p-5"><span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-600">{s.class}</span></td>
                <td className="p-5">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => handleOpenEdit(s)} className="p-2 text-blue-600 bg-blue-50 rounded-xl"><Edit2 size={16} /></button>
                    <button onClick={() => onDelete(s.id)} className="p-2 text-red-600 bg-red-50 rounded-xl"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStudent ? "Editar Aluno" : "Novo Aluno"}>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData, editingStudent?.id); setIsModalOpen(false); }} className="space-y-4">
          <input type="text" placeholder="Nome Completo" className="w-full p-4 border rounded-2xl font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <select className="w-full p-4 border rounded-2xl font-bold" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})}>
            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg">Salvar Aluno</button>
        </form>
      </Modal>
    </div>
  );
};

export default App;
