import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Package, Users, ArrowLeftRight, TrendingDown, LayoutDashboard,
  Plus, Trash2, Edit2, CheckCircle2, AlertCircle, X, PlusCircle,
  TriangleAlert, CloudDownload, CloudUpload, Loader2, Search,
  UserPlus, Download, Settings
} from 'lucide-react';
import { Transaction, TransactionType, Student, StudentWithdrawal, StockSummary, Part } from './types';
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
const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4">
      <Loader2 className="animate-spin text-red-600" />
      <span className="font-bold text-slate-700">Processando...</span>
    </div>
  </div>
);

// --- COMPONENTE PRINCIPAL DE LAYOUT ---
const SidebarItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
      active 
      ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-semibold text-sm">{label}</span>
  </Link>
);

const AppLayout = ({ children, stats }: { children: React.ReactNode, stats: any }) => {
  const location = useLocation();
  
  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0d1117] text-white flex flex-col flex-shrink-0">
        <div className="p-8">
          <h1 className="text-2xl font-black italic tracking-tighter">SENAI</h1>
          <p className="text-[10px] text-gray-500 tracking-[0.3em] uppercase mt-1">Usinagem</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <div className="pb-4 text-[10px] font-bold text-gray-600 uppercase px-4 tracking-widest">Almoxarifado</div>
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
          <SidebarItem to="/students" icon={Users} label="Retirada Alunos" active={location.pathname === '/students'} />
          <SidebarItem to="/transactions" icon={ArrowLeftRight} label="Movimentação" active={location.pathname === '/transactions'} />
          <SidebarItem to="/stock" icon={Package} label="Ver Estoque" active={location.pathname === '/stock'} />
        </nav>

        <div className="p-6 border-t border-gray-800">
          <button className="flex items-center gap-3 text-gray-500 hover:text-white w-full">
            <Settings size={18} />
            <span className="text-sm">Configurações</span>
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          
          {/* HEADER CARD */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-wrap items-center gap-8 mb-10 w-full max-w-full">
            <div className="bg-red-600 text-white px-10 py-5 rounded-3xl font-black text-3xl shadow-xl italic shadow-red-100">
              SENAI
            </div>
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-3xl font-black text-slate-800 uppercase italic">Mecânico de Usinagem</h2>
              <p className="text-slate-400 font-bold tracking-widest text-xs">CONTROLE DE ESTOQUE E ENTREGA</p>
            </div>
          </div>

          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard label="Alunos" value={stats.students} icon={<Users />} color="blue" />
            <CardStat label="Estoque" value={stats.stock} icon={<Package />} color="green" />
            <CardStat label="Entregues" value={stats.delivered} icon={<CheckCircle2 />} color="purple" />
            <CardStat label="Críticos" value={stats.critical} icon={<TriangleAlert />} color="red" />
          </div>

          {/* O CONTEÚDO DAS ROTAS ENTRA AQUI */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm min-h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---
const CardStat = ({ label, value, icon, color }: any) => {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600"
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-50 flex items-center gap-4 shadow-sm">
      <div className={`p-4 rounded-2xl ${colors[color]}`}>{React.cloneElement(icon, { size: 24 })}</div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
};

// ... (Aqui continuariam as funções Dashboard, StudentsPage, etc., do seu arquivo original)
// Para manter o arquivo funcional, você deve manter todas as funções originais que enviou no arquivo App.tsx

export default function App() {
  // Mantenha toda a lógica de state e useEffect do seu arquivo original aqui
  return (
    <Router>
      <Routes>
        {/* Envolva suas rotas no AppLayout para manter o visual fixo */}
        <Route path="/" element={<AppLayout stats={{students: 1, stock: 0, delivered: 0, critical: 0}}><DashboardContent /></AppLayout>} />
        {/* Adicione as demais rotas conforme seu arquivo original */}
      </Routes>
    </Router>
  );
}
