import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Package, 
  Users, 
  ArrowLeftRight, 
  LayoutDashboard,
  PlusCircle,
  TriangleAlert,
  Loader2,
  Search,
  Settings,
  LogOut,
  Lock
} from 'lucide-react';
import { 
  Transaction, 
  TransactionType, 
  Student, 
  Part
} from './types';
import { CLASSES } from './constants';
import { db } from './dataService';

// --- Componentes Auxiliares ---

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-300">
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-600 font-bold animate-pulse">Sincronizando...</p>
    </div>
  </div>
);

// --- Componente de Login ---

const LoginScreen = ({ onLogin }: { onLogin: (pass: string) => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'ianes662') {
      onLogin(password);
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans p-4">
      <div className="bg-white p-10 rounded-[2rem] shadow-xl w-full max-w-sm text-center border-t-[6px] border-red-700">
        <h1 className="text-red-700 text-5xl font-black italic tracking-tighter mb-1">SENAI</h1>
        <p className="font-bold text-slate-800 text-sm leading-tight uppercase tracking-tight">
          Mecânico de Usinagem<br/>Convencional
        </p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 mb-8">
          Planos de Demonstrações
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
              Senha de Acesso
            </label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                placeholder="••••••••"
                className={`w-full p-4 bg-slate-50 rounded-2xl border-2 transition-all text-center text-xl tracking-[0.3em] focus:outline-none ${
                  error ? 'border-red-500 animate-shake' : 'border-transparent focus:border-red-600'
                }`}
                autoFocus
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            </div>
            {error && <p className="text-red-500 text-[10px] font-bold text-center mt-2 uppercase tracking-wider">Senha Incorreta</p>}
          </div>
          
          <button 
            type="submit"
            className="w-full py-4 bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-800 transition-colors shadow-lg shadow-red-900/20"
          >
            Acessar Sistema
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Componente Principal App ---

export default function App() {
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return localStorage.getItem('auth_session') === 'true';
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsAuthorized(true);
      localStorage.setItem('auth_session', 'true');
      setIsLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    localStorage.removeItem('auth_session');
  };

  if (!isAuthorized) {
    return (
      <>
        {isLoading && <LoadingOverlay />}
        <LoginScreen onLogin={handleLogin} />
      </>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        {/* Sidebar */}
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

          <div className="p-4 mt-auto border-t border-slate-800">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
            >
              <LogOut size={18} />
              SAIR DO SISTEMA
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative p-8">
          <Routes>
            <Route path="/" element={<DashboardView />} />
            <Route path="/stock" element={<StockView />} />
            <Route path="/students" element={<StudentsView />} />
            <Route path="/transactions" element={<TransactionsView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Helper para links da Sidebar
function SidebarLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
        isActive 
          ? 'bg-red-600 text-white shadow-lg shadow-red-600/20 font-bold' 
          : 'hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-red-500'}`}>
        {icon}
      </span>
      <span className="text-sm tracking-wide uppercase font-bold">{label}</span>
    </Link>
  );
}

// Views Simplificadas (Substitua pelos seus componentes reais se estiverem em outros arquivos)
function DashboardView() { return <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Dashboard Overview</h2>; }
function StockView() { return <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Estoque de Materiais</h2>; }
function StudentsView() { return <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Gestão de Alunos</h2>; }
function TransactionsView() { return <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Histórico de Movimentações</h2>; }
