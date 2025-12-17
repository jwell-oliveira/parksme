
import React, { useState, useEffect, useCallback } from 'react';
import { Vehicle, VehicleStatus } from './types';
import VehicleCard from './components/VehicleCard';
import AdminSettings from './components/AdminSettings';

const App: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('sigapark_vehicles');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Salvar veículos localmente quando houver alteração de status ou novos dados
  useEffect(() => {
    localStorage.setItem('sigapark_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  const handleDataImport = (newVehicles: Vehicle[]) => {
    setVehicles(newVehicles);
  };

  const handleAction = useCallback((id: string, action: 'ENTRY' | 'EXIT') => {
    setVehicles(prev => prev.map(v => {
      if (v.id === id) {
        const newStatus = action === 'ENTRY' ? VehicleStatus.IN : VehicleStatus.OUT;
        return { ...v, status: newStatus };
      }
      return v;
    }));
  }, []);

  const filteredVehicles = vehicles.filter(v => 
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.coordination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminSettings 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        onDataImport={handleDataImport}
      />
      
      <header className="bg-slate-900 text-white p-5 sticky top-0 z-50 shadow-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/20 rotate-3">P</div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic">PARK <span className="text-blue-500 not-italic ml-1">SME</span></h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">Gestão de Estacionamento</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsAdminOpen(true)} 
            className="bg-slate-800 p-3 rounded-2xl hover:bg-slate-700 transition-all text-slate-300 hover:text-white group border border-slate-700"
          >
            <svg className="w-6 h-6 group-hover:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-8 w-full flex-grow">
        <div className="space-y-8">
          <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-200">
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input 
                type="text" 
                placeholder="Pesquisar por placa, motorista ou setor..." 
                className="w-full pl-16 pr-8 py-6 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all font-bold text-lg" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>

          {vehicles.length === 0 ? (
            <div className="bg-white p-32 text-center rounded-[4rem] border-4 border-dashed border-slate-200 flex flex-col items-center gap-8">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <div>
                <p className="text-xl text-slate-800 font-black uppercase tracking-widest mb-2">Sem Dados Importados</p>
                <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto">Acesse as configurações para fazer o upload do arquivo da planilha.</p>
              </div>
              <button onClick={() => setIsAdminOpen(true)} className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase hover:bg-black transition-all shadow-2xl">Importar Agora</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVehicles.map(v => (
                <VehicleCard key={v.id} vehicle={v} onAction={handleAction} />
              ))}
              {filteredVehicles.length === 0 && (
                <div className="col-span-full py-32 text-center text-slate-400 font-black uppercase tracking-[0.4em] bg-white rounded-[3rem] border-2 border-slate-100">Registro não encontrado</div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <footer className="p-10 text-center border-t border-slate-200 bg-white">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em]">PARK SME • SISTEMA DE GESTÃO DE ACESSO</p>
      </footer>
    </div>
  );
};

export default App;
