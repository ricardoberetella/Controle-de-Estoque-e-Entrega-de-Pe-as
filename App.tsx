import React, { useState } from 'react';
import { 
  Users, Box, CheckCircle, AlertTriangle, 
  Home, Layout, ClipboardList, Settings, Menu, X 
} from 'lucide-react';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('Início');

  // Dados dos Cards Superiores
  const stats = [
    { label: 'Alunos', value: '1', icon: <Users size={24} />, color: 'blue' },
    { label: 'Estoque', value: '0', icon: <Box size={24} />, color: 'green' },
    { label: 'Entregues', value: '0', icon: <CheckCircle size={24} />, color: 'purple' },
    { label: 'Críticos', value: '0', icon: <AlertTriangle size={24} />, color: 'red' },
  ];

  const cores: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600"
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden">
      
      {/* SIDEBAR - Fixa e contida */}
      <aside className="w-64 bg-[#0d1117] text-white flex flex-col flex-shrink-0 shadow-xl">
        <div className="p-8">
          <h1 className="text-3xl font-black italic tracking-tighter text-white">SENAI</h1>
          <p className="text-[10px] text-gray-500 tracking-[0.3em] uppercase mt-1">Usinagem</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <div className="pb-2 text-[10px] font-bold text-gray-600 uppercase px-4 tracking-widest">Menu Principal</div>
          
          {[
            { n: 'Início', i: <Home size={20} /> },
            { n: 'Retirada Alunos', i: <Users size={20} /> },
            { n: 'Movimentação', i: <Layout size={20} /> },
            { n: 'Ver Estoque', i: <Box size={20} /> },
            { n: 'Planejamento', i: <ClipboardList size={20} /> }
          ].map((item) => (
            <button
              key={item.n}
              onClick={() => setAbaAtiva(item.n)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                abaAtiva === item.n 
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.i}
              <span className="font-semibold text-sm">{item.n}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
           <button className="flex items-center gap-3 p-3 text-gray-400 hover:text-white w-full">
             <Settings size={20} /> <span className="text-sm">Configurações</span>
           </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL - Onde o conteúdo fica preso dentro do retângulo */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {/* HEADER CARD - Resolvido o problema de sair fora do retângulo */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-200 flex flex-wrap items-center gap-6 mb-8 w-full max-w-full">
            <div className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-3xl shadow-xl shadow-red-100 italic">
              SENAI
            </div>
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 uppercase italic leading-none">
                Mecânico de Usinagem
              </h2>
              <p className="text-slate-400 font-bold tracking-widest text-xs md:text-sm mt-1">
                CONTROLE DE ESTOQUE E ENTREGA
              </p>
            </div>
          </div>

          {/* GRID DE CARDS - Ajustado para não quebrar o layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className={`p-4 rounded-2xl ${cores[stat.color]}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-800 leading-none">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Área de conteúdo dinâmico (onde você colocará suas tabelas/listas) */}
          <div className="mt-8 bg-white rounded-[2rem] p-8 border border-gray-100 min-h-[400px] shadow-sm">
             <h3 className="text-slate-800 font-bold text-xl mb-4">Conteúdo: {abaAtiva}</h3>
             <p className="text-gray-500 italic">Aqui os dados de {abaAtiva.toLowerCase()} serão exibidos dentro dos limites.</p>
          </div>

        </div>
      </main>
    </div>
  );
}
