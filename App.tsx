import React from 'react';
import { Users, Box, CheckCircle, AlertTriangle, Home, Layout, ClipboardList, Settings } from 'lucide-react';

const Dashboard = () => {
  return (
    // Container Pai: Ocupa a tela toda e impede o scroll horizontal
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      
      {/* SIDEBAR - Largura fixa, altura total */}
      <aside className="w-64 bg-[#0d1117] text-white flex flex-col flex-shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-black italic tracking-tighter">SENAI</h1>
          <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase">Usinagem</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <div className="flex items-center gap-3 bg-red-600 p-3 rounded-lg cursor-pointer">
            <Home size={20} /> <span className="font-medium">Início</span>
          </div>
          
          <div className="pt-4 pb-2 text-[10px] font-bold text-gray-500 uppercase px-3">Almoxarifado</div>
          
          <div className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer text-gray-300">
            <Users size={20} /> <span>Retirada Alunos</span>
          </div>
          <div className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer text-gray-300">
            <Layout size={20} /> <span>Movimentação</span>
          </div>
          <div className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer text-gray-300">
            <Box size={20} /> <span>Ver Estoque</span>
          </div>
          <div className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer text-gray-300">
            <ClipboardList size={20} /> <span>Planejamento</span>
          </div>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL - flex-1 garante que ela use apenas o espaço que sobra */}
      <main className="flex-1 flex flex-col overflow-y-auto p-8">
        
        {/* Header Card corrigido para não esticar fora do limite */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-6 mb-8 w-full">
          <div className="bg-red-600 text-white px-6 py-4 rounded-2xl font-black text-2xl shadow-lg shadow-red-200">
            SENAI
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-800 uppercase italic">Mecânico de Usinagem</h2>
            <p className="text-slate-500 font-medium tracking-wide">CONTROLE DE ESTOQUE E ENTREGA</p>
          </div>
        </div>

        {/* Grid de Cards - Responsivo e contido */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          
          {/* Card Alunos */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Alunos</p>
              <p className="text-2xl font-bold text-slate-800">1</p>
            </div>
          </div>

          {/* Card Estoque */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-50 p-4 rounded-2xl text-green-600">
              <Box size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Estoque</p>
              <p className="text-2xl font-bold text-slate-800">0</p>
            </div>
          </div>

          {/* Card Entregues */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-purple-50 p-4 rounded-2xl text-purple-600">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Entregues</p>
              <p className="text-2xl font-bold text-slate-800">0</p>
            </div>
          </div>

          {/* Card Críticos */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-red-50 p-4 rounded-2xl text-red-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Críticos</p>
              <p className="text-2xl font-bold text-slate-800">0</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
