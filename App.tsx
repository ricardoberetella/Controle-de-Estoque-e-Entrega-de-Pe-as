import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Package, Users, ArrowLeftRight, LayoutDashboard,
  CheckCircle2, TriangleAlert, Settings, Search, Menu, X
} from 'lucide-react';
import { Transaction, TransactionType, Student, StudentWithdrawal, StockSummary, Part } from './types';
import { CLASSES } from './constants';
import { generateId, formatDate } from './utils';
import { db } from './dataService';

// --- COMPONENTE DE LAYOUT CORRIGIDO ---
const AppLayout = ({ children, stats }: { children: React.ReactNode, stats: any }) => {
  const location = useLocation();

  const menuItems = [
    { id: '/', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/students', label: 'Retirada Alunos', icon: Users },
    { id: '/transactions', label: 'Movimentação', icon: ArrowLeftRight },
    { id: '/stock', label: 'Ver Estoque', icon: Package },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F1F5F9] overflow-hidden font-['Inter',sans-serif]">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0d1117] text-white flex flex-col flex-shrink-0 shadow-2xl">
        <div className="p-8">
          <h1 className="text-2xl font-black italic tracking-tighter">SENAI</h1>
          <p className="text-[10px] text-gray-500 tracking-[0.3em] uppercase mt-1">Usinagem</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <div className="pb-4 text-[10px] font-bold text-gray-600 uppercase px-4 tracking-widest">Almoxarifado</div>
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                location.pathname === item.id 
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-semibold text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL COM SCROLL INTERNO */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          
          {/* HEADER FIXO NO TOPO */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-wrap items-center gap-8 mb-10 w-full max-w-full">
            <div className="bg-red-600 text-white px-10 py-5 rounded-3xl font-black text-3xl shadow-xl italic shadow-red-100">
              SENAI
            </div>
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tight">Mecânico de Usinagem</h2>
              <p className="text-slate-400 font-bold tracking-widest text-xs mt-1">CONTROLE DE ESTOQUE E ENTREGA</p>
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard label="Alunos" value={stats.studentsCount} icon={<Users />} color="blue" />
            <StatCard label="Estoque" value={stats.totalStock} icon={<Package />} color="green" />
            <StatCard label="Entregues" value={stats.deliveredCount} icon={<CheckCircle2 />} color="purple" />
            <StatCard label="Críticos" value={stats.criticalItems} icon={<TriangleAlert />} color="red" />
          </div>

          {/* ÁREA BRANCA ONDE O CONTEÚDO ORIGINAL VAI APARECER */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            {children}
          </div>

        </div>
      </main>
    </div>
  );
};

// Componente de Card
function StatCard({ label, value, icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600"
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-50 flex items-center gap-4 shadow-sm hover:scale-[1.02] transition-transform">
      <div className={`p-4 rounded-2xl ${colors[color]}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-slate-800 leading-none mt-1">{value}</p>
      </div>
    </div>
  );
}

// --- APP COMPONENT ---
export default function App() {
  // Usei aqui a sua lógica original de buscar dados
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [t, s] = await Promise.all([
          db.transactions.toArray(),
          db.students.toArray()
        ]);
        setTransactions(t);
        setStudents(s);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = useMemo(() => ({
    studentsCount: students.length,
    totalStock: transactions.filter(t => t.type === TransactionType.ENTRY).length, // Exemplo de cálculo
    deliveredCount: transactions.filter(t => t.type === TransactionType.WITHDRAWAL).length,
    criticalItems: 0 // Sua lógica original aqui
  }), [transactions, students]);

  if (loading) return <div className="h-screen flex items-center justify-center font-bold">Carregando Banco de Dados...</div>;

  return (
    <Router>
      <AppLayout stats={stats}>
        <Routes>
          <Route path="/" element={<h2 className="text-xl font-bold">Bem-vindo ao Dashboard</h2>} />
          <Route path="/students" element={<h2 className="text-xl font-bold">Área de Alunos</h2>} />
          <Route path="/transactions" element={<h2 className="text-xl font-bold">Área de Movimentação</h2>} />
          <Route path="/stock" element={<h2 className="text-xl font-bold">Área de Estoque</h2>} />
        </Routes>
      </AppLayout>
    </Router>
  );
}
