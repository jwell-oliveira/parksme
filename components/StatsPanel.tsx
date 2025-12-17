
import React from 'react';
import { Vehicle, VehicleStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface StatsPanelProps {
  vehicles: Vehicle[];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ vehicles }) => {
  const inside = vehicles.filter(v => v.status === VehicleStatus.IN).length;
  const expected = vehicles.filter(v => v.status === VehicleStatus.EXPECTED).length;
  const out = vehicles.filter(v => v.status === VehicleStatus.OUT).length;

  const data = [
    { name: 'No Pátio', value: inside, color: '#16a34a' },
    { name: 'Esperados', value: expected, color: '#2563eb' },
    { name: 'Saíram', value: out, color: '#94a3b8' },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Visão Geral</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-slate-600 font-medium">{item.name}</span>
              </div>
              <span className="text-lg font-bold text-slate-800">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
