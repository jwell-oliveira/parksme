
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Vehicle, VehicleStatus } from '../types';

interface AdminSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onDataImport: (vehicles: Vehicle[]) => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ isOpen, onClose, onDataImport }) => {
  const [step, setStep] = useState<'password' | 'settings'>('password');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'adm123') {
      setStep('settings');
      setError('');
    } else {
      setError('Senha incorreta!');
    }
  };

  const handleSync = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const sheetId = '1w6rYjAC2BVWi8Y-barRkT1Le1yC6mlBq8bhiec7pFbg';
      
      // Tentar via API local primeiro (Vercel), depois fallback direto
      const urls = [
        `/api/sheets?sheetId=${sheetId}&format=csv`,
        `/api/sheets?sheetId=${sheetId}&format=xlsx`,
        `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`,
      ];

      let response: Response | null = null;
      let selectedFormat = 'csv';
      let errors: string[] = [];

      for (const url of urls) {
        const format = url.includes('xlsx') ? 'xlsx' : 'csv';
        try {
          response = await Promise.race([
            fetch(url, { 
              mode: 'cors',
              headers: { 'Accept': '*/*' }
            }),
            new Promise<Response>((_, reject) => 
              setTimeout(() => reject(new Error('Timeout (10s)')), 10000)
            )
          ]);
          
          if (response?.ok) {
            selectedFormat = format;
            console.log(`✓ Conectado com sucesso usando ${url.includes('/api/') ? 'API' : 'direto'}`);
            break;
          } else {
            errors.push(`${url}: ${response?.status}`);
          }
        } catch (err) {
          errors.push(`${url}: ${(err as Error).message}`);
        }
      }

      if (!response?.ok || !response) {
        throw new Error(`Todas as tentativas falharam:\n${errors.join('\n')}`);
      }

      let wb;
      if (selectedFormat === 'csv') {
        const text = await response.text();
        const lines = text.split('\n');
        const data = lines.map(line => line.split(','));
        wb = { SheetNames: ['Sheet1'], Sheets: { Sheet1: XLSX.utils.aoa_to_sheet(data) } };
      } else {
        const arrayBuffer = await response.arrayBuffer();
        wb = XLSX.read(arrayBuffer, { type: 'array' });
      }
      const allVehicles: Vehicle[] = [];

      wb.SheetNames.forEach((sheetName) => {
        const ws = wb.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        if (data.length < 1) return;

        // Localizar cabeçalho
        let headerRowIndex = -1;
        let colMap: Record<string, number> = {};

        for (let i = 0; i < Math.min(data.length, 10); i++) {
          const row = data[i].map(cell => String(cell || '').toUpperCase().trim());
          if (row.some(t => t.includes('NOME') || t.includes('PLACA'))) {
            headerRowIndex = i;
            row.forEach((txt, idx) => {
              if (txt.includes('NOME')) colMap['name'] = idx;
              if (txt.includes('PLACA')) colMap['plate'] = idx;
              if (txt.includes('COORDENADORIA')) colMap['coord'] = idx;
              if (txt.includes('LOTAÇÃO')) colMap['loc'] = idx;
              if (txt.includes('TELEFONE')) colMap['phone'] = idx;
              if (txt.includes('GRUPO')) colMap['group'] = idx;
            });
            break;
          }
        }

        if (colMap['name'] === undefined) return;

        // Extrair dados
        for (let i = headerRowIndex + 1; i < data.length; i++) {
          const row = data[i];
          const getValue = (idx: number | undefined) => idx !== undefined ? String(row[idx] || '').trim() : '';

          const name = getValue(colMap['name']);
          const plate = getValue(colMap['plate']).toUpperCase().replace(/\s/g, '');

          if (!name || name === "" || name.includes('NOME')) continue;

          allVehicles.push({
            id: `v-${sheetName}-${i}-${plate || Math.random()}`,
            ownerName: name,
            plate: plate || 'S/ PLACA',
            location: getValue(colMap['loc']) || 'N/A',
            coordination: getValue(colMap['coord']) || 'N/A',
            phone: getValue(colMap['phone']) || 'S/N',
            group: getValue(colMap['group']) || 'Geral',
            status: VehicleStatus.EXPECTED
          });
        }
      });

      if (allVehicles.length > 0) {
        onDataImport(allVehicles);
        onClose();
        setStep('password');
        setPassword('');
      } else {
        setError('Nenhum dado válido encontrado na planilha.');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Erro detalhado:', errorMsg);
      setError(`Falha: ${errorMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };



  const processFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const allVehicles: Vehicle[] = [];

        wb.SheetNames.forEach((sheetName) => {
          const ws = wb.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

          if (data.length < 1) return;

          // Localizar cabeçalho
          let headerRowIndex = -1;
          let colMap: Record<string, number> = {};

          for (let i = 0; i < Math.min(data.length, 10); i++) {
            const row = data[i].map(cell => String(cell || '').toUpperCase().trim());
            if (row.some(t => t.includes('NOME') || t.includes('PLACA'))) {
              headerRowIndex = i;
              row.forEach((txt, idx) => {
                if (txt.includes('NOME')) colMap['name'] = idx;
                if (txt.includes('PLACA')) colMap['plate'] = idx;
                if (txt.includes('COORDENADORIA')) colMap['coord'] = idx;
                if (txt.includes('LOTAÇÃO')) colMap['loc'] = idx;
                if (txt.includes('TELEFONE')) colMap['phone'] = idx;
                if (txt.includes('GRUPO')) colMap['group'] = idx;
              });
              break;
            }
          }

          if (colMap['name'] === undefined) return;

          // Extrair dados
          for (let i = headerRowIndex + 1; i < data.length; i++) {
            const row = data[i];
            const getValue = (idx: number | undefined) => idx !== undefined ? String(row[idx] || '').trim() : '';

            const name = getValue(colMap['name']);
            const plate = getValue(colMap['plate']).toUpperCase().replace(/\s/g, '');

            if (!name || name === "" || name.includes('NOME')) continue;

            allVehicles.push({
              id: `v-${sheetName}-${i}-${plate || Math.random()}`,
              ownerName: name,
              plate: plate || 'S/ PLACA',
              location: getValue(colMap['loc']) || 'N/A',
              coordination: getValue(colMap['coord']) || 'N/A',
              phone: getValue(colMap['phone']) || 'S/N',
              group: getValue(colMap['group']) || 'Geral',
              status: VehicleStatus.EXPECTED
            });
          }
        });

        if (allVehicles.length > 0) {
          onDataImport(allVehicles);
          onClose();
          setStep('password');
          setPassword('');
        } else {
          setError('Nenhum dado válido encontrado no arquivo.');
        }
      } catch (err) {
        setError('Erro ao processar o arquivo. Tente outro formato.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleClose = () => {
    setStep('password');
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20">
        {step === 'password' ? (
          <form onSubmit={handleLogin} className="p-10 text-center space-y-8">
            <div className="w-20 h-20 bg-slate-900 text-blue-500 rounded-3xl flex items-center justify-center mx-auto rotate-3">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Painel Admin</h2>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Controle de Importação</p>
            </div>

            <div className="space-y-4">
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha de acesso"
                className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-blue-600 focus:bg-white transition-all text-center text-lg font-black tracking-[0.5em]"
              />
              {error && <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest">{error}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={handleClose} className="flex-1 py-5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
              <button type="submit" className="flex-[2] bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl">Autenticar</button>
            </div>
          </form>
        ) : (
          <div className="p-10 space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">IMPORTAR PLANILHA</h2>
              <button onClick={() => setStep('password')} className="text-rose-500 text-[10px] font-black uppercase tracking-widest">Logout</button>
            </div>

            <div className="space-y-6">
              <div className="space-y-6">
                {/* Opção 1: Upload de Arquivo */}
                <div
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={`border-4 border-dashed border-slate-100 rounded-[2rem] p-8 text-center cursor-pointer transition-all hover:bg-emerald-50 hover:border-emerald-200 group ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm mb-1">
                    Upload de Arquivo
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">.xlsx, .xls ou .csv</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={processFile}
                  />
                </div>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-300 text-[10px] font-black uppercase tracking-widest">OU</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>

                {/* Opção 2: Google Sheets */}
                <div
                  onClick={() => !isProcessing && handleSync()}
                  className={`border-4 border-dashed border-slate-100 rounded-[2rem] p-8 text-center cursor-pointer transition-all hover:bg-blue-50 hover:border-blue-200 group ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    {isProcessing ? (
                      <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    )}
                  </div>
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm mb-1">
                    {isProcessing ? 'Sincronizando...' : 'Google Sheets'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Sincronizar da nuvem</p>
                </div>

                {error && <p className="bg-rose-50 text-rose-600 p-4 rounded-xl text-center text-[10px] font-black uppercase tracking-widest border border-rose-100">{error}</p>}

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-[11px] font-black text-slate-900 uppercase mb-3 tracking-widest">Fonte de Dados:</p>
                  <p className="text-[10px] text-slate-500 font-bold break-all">
                    https://docs.google.com/spreadsheets/d/1w6rYjAC2BVWi8Y-barRkT1Le1yC6mlBq8bhiec7pFbg/export?format=csv
                  </p>
                </div>
              </div>

              <button onClick={handleClose} className="w-full py-5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Fechar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
