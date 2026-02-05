import React, { useState } from 'react';
import { 
  Users, Box, CheckCircle, AlertTriangle, 
  Home, Layout, ClipboardList, Settings, Search 
} from 'lucide-react';

export default function App() {
  // Estado para controlar qual menu está selecionado
  const [abaAtiva, setAbaAtiva] = useState('Início');

  const menuItems = [
    { id: 'Início', icon: <Home size={20} /> },
    { id: 'Retirada Alunos', icon: <Users size={20} /> },
    { id: 'Movimentação', icon: <Layout size={20} /> },
    { id: 'Ver Estoque', icon: <Box size={20} /> },
    { id: 'Planejamento', icon: <ClipboardList size={20} /> }
  ];

  return (
    // overflow-hidden no pai evita que qualquer coisa saia da tela
    <div className="flex h-screen w-full bg-[#F1F5F9] overflow-hidden">
      
      {/* SIDEBAR - Barra Lateral Preta */}
      <aside className="w-64 bg-[#0d1117] text-white flex flex-col flex-shrink-0 shadow-2xl">
        <div className="p-8">
          <h1 className="text-2xl font-black italic tracking-tighter">SENAI</h1>
          <p className="text-[10px] text-gray-500 tracking-[0.3em] uppercase mt-1">Usinagem</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <div className="pb-4 text-[10px] font-bold text-gray-600 uppercase px-4 tracking-widest">Almoxarifado</div>
          
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setAbaAtiva(item.id)} // Faz o botão funcionar
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
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

        <div className="p-6 border-t border-gray-800">
          <button className="flex items-center gap-3 text-gray-500 hover:text-white w-full">
            <Settings size={18} />
            <span className="text-sm">Configurações</span>
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL - O "min-w-0" é o segredo para não sair do retângulo */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          
          {/* HEADER (Retângulo Branco Superior) */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-wrap items-center gap-8 mb-10 w-full max-w-full">
            <div className="bg-red-600 text-white px-10 py-5 rounded-3xl font-black text-3xl shadow-xl italic">
              SENAI
            </div>
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-3xl md:text-4xl font-black text-slate-800 uppercase italic leading-tight">
                Mecânico de Usinagem
              </h2>
              <p className="text-slate-400 font-bold tracking-widest text-sm mt-1">
                CONTROLE DE ESTOQUE E ENTREGA
              </p>
            </div>
          </div>

          {/* GRID DE CARDS (Alunos, Estoque, etc) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <CardStat label="Alunos" value="1" icon={<Users />} color="blue" />
            <CardStat label="Estoque" value="0" icon={<Box />} color="green" />
            <CardStat label="Entregues" value="0" icon={<CheckCircle />} color="purple" />
            <CardStat label="Críticos" value="0" icon={<AlertTriangle />} color="red" />
          </div>

          {/* ÁREA DE CONTEÚDO DINÂMICO */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm min-h-[300px]">
            <h3 className="text-2xl font-black text-slate-800 uppercase italic mb-4">
              {abaAtiva}
            </h3>
            <div className="h-px bg-gray-100 w-full mb-6"></div>
            <p className="text-gray-400">Mostrando informações de: <strong>{abaAtiva}</strong></p>
          </div>

        </div>
      </main>
    </div>
  );
}

// Sub-componente para os cards de estatística
function CardStat({ label, value, icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600"
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-50 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`p-4 rounded-2xl ${colors[color]}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}
