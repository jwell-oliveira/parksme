
import React from 'react';
import { Vehicle, VehicleStatus } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onAction: (id: string, action: 'ENTRY' | 'EXIT') => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onAction }) => {
  const isInside = vehicle.status === VehicleStatus.IN;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 transition-all hover:shadow-md flex flex-col h-full">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-black text-xl text-slate-900 tracking-tight">{vehicle.plate}</h3>
          <p className="text-sm font-bold text-blue-600 uppercase text-[10px] tracking-widest">{vehicle.group}</p>
        </div>
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
          vehicle.status === VehicleStatus.IN ? 'bg-green-100 text-green-700' : 
          vehicle.status === VehicleStatus.OUT ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'
        }`}>
          {vehicle.status === VehicleStatus.IN ? 'No Pátio' : 
           vehicle.status === VehicleStatus.OUT ? 'Saiu' : 'Aguardando'}
        </span>
      </div>
      
      <div className="space-y-1 mb-4 flex-grow">
        <p className="text-sm font-semibold text-slate-800 line-clamp-1">{vehicle.ownerName}</p>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="text-slate-500">
            <span className="block text-[9px] uppercase font-bold text-slate-400">Coordenadoria</span>
            {vehicle.coordination}
          </div>
          <div className="text-slate-500 text-right">
            <span className="block text-[9px] uppercase font-bold text-slate-400">Lotação</span>
            {vehicle.location}
          </div>
        </div>
        <div className="pt-2 flex items-center gap-2 text-slate-500">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="text-[11px] font-mono">{vehicle.phone}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-auto">
        {!isInside ? (
          <button
            onClick={() => onAction(vehicle.id, 'ENTRY')}
            className="flex-1 bg-slate-900 hover:bg-black text-white font-bold py-2 rounded-lg transition-colors text-xs"
          >
            Registrar Entrada
          </button>
        ) : (
          <button
            onClick={() => onAction(vehicle.id, 'EXIT')}
            className="flex-1 border-2 border-rose-600 text-rose-600 hover:bg-rose-50 font-bold py-2 rounded-lg transition-colors text-xs"
          >
            Registrar Saída
          </button>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
