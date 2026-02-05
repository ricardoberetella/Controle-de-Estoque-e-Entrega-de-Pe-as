import React, { useState } from 'react';
import { 
  Users, Box, CheckCircle, AlertTriangle, 
  Home, Layout, ClipboardList, Settings, Search 
} from 'lucide-react';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('Início');

  const menuItems = [
    { id: 'Início', icon: <Home size={20} /> },
    { id: 'Retirada Alunos', icon: <Users size={20} /> },
    { id: 'Movimentação', icon: <Layout size={20} /> },
    { id: 'Ver Estoque', icon: <Box size={20} /> },
    { id: 'Planejamento', icon: <ClipboardList size={20} /> }
  ];

  return (
    <div className="flex h-screen w-full bg-[#F3F4F6] overflow-hidden">
      
      {/* SIDEBAR - Fixa na esquerda */}
      <aside className="w-64 bg-[#0d1117] text-white flex flex-col flex-shrink-0 shadow-2xl">
        <div className="p-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-red-600 rounded-full"></div>
            <h1 className="text-2xl font-black italic tracking-tighter">SENAI</h1>
          </div>
          <p className="text-[10px] text-gray-500 tracking-[0.3em] uppercase mt-1 ml-4">Usinagem</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <div className="pb-4 text-[10px] font-bold text-gray-600 uppercase px-4 tracking-[0.2em]">Almoxarifado</div>
          
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setAbaAtiva(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                abaAtiva === item.id 
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-semibold text-sm">{item.id}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-800/50">
          <button className="flex items-center gap-3 text-gray-500 hover:text-white transition-colors w-full">
            <Settings size={18} />
            <span className="text-sm font-medium">Configurações</span>
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL - min-w-0 impede que os cards empurrem a tela */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          
          {/* HEADER - Ajustado para ser responsivo e contido */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-wrap items-center gap-8 mb-10 w-full">
            <div className="bg-red-600 text-white px-10 py-5 rounded-3xl font-black text-3xl shadow-2xl shadow-red-100 italic">
              SENAI
            </div>
            <div className="flex-1 min-w-[250px]">
              <h2 className="text-3xl md:text-4xl font-black text-slate-800 uppercase italic tracking-tight">
                Mecânico de Usinagem
              </h2>
              <p className="text-slate-400 font-bold tracking-[0.15em] text-sm mt-1">
                CONTROLE DE ESTOQUE E ENTREGA
              </p>
            </div>
          </div>

          {/* GRID DE CARDS - Alunos, Estoque, Entregues, Críticos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <CardStat label="Alunos" value="1" icon={<Users />} color="blue" />
            <CardStat label="Estoque" value="0" icon={<Box />} color="green" />
            <CardStat label="Entregues" value="0" icon={<CheckCircle />} color="purple" />
            <CardStat label="Críticos" value="0" icon={<AlertTriangle />} color="red" />
          </div>

          {/* CONTEÚDO DINÂMICO */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm min-h-[300px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800 italic uppercase">{abaAtiva}</h3>
              <div className="flex gap-2">
                <div className="bg-gray-100 p-2 rounded-lg text-gray-400"><Search size={20} /></div>
              </div>
            </div>
            <div className="border-2 border-dashed border-gray-100 rounded-3xl flex items-center justify-center h-48">
               <p className="text-gray-400 font-medium">Painel de {abaAtiva} carregado com sucesso.</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// Componente de Card para evitar repetição de código
function CardStat({ label, value, icon, color }: any) {
  const styles: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600"
  };

  return (
    <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-gray-50 flex items-center gap-5 hover:scale-[1.02] transition-transform cursor-default">
      <div className={`p-4 rounded-2xl ${styles[color]}`}>
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <div>
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}
