import React, { useState } from 'react';

const API_URL = 'http://localhost:9091/api';

interface WorkshopCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ownerId: string | null;
}

const diasSemana = [
  { value: 'LUNES', label: 'Lunes' },
  { value: 'MARTES', label: 'Martes' },
  { value: 'MIERCOLES', label: 'Miércoles' },
  { value: 'JUEVES', label: 'Jueves' },
  { value: 'VIERNES', label: 'Viernes' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' },
];

export function WorkshopCreationModal({ isOpen, onClose, onSuccess, ownerId }: WorkshopCreationModalProps) {
  const [form, setForm] = useState({
    cif: '',
    companyName: '',
    address: '',
    workingDays: [] as string[],
    openTime: '09:00',
    closeTime: '18:00',
  });

  const handleDiasCambio = (dia: string) => {
    setForm(prev => {
      const workingDays = prev.workingDays.includes(dia)
        ? prev.workingDays.filter(d => d !== dia)
        : [...prev.workingDays, dia];
      return { ...prev, workingDays };
    });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const prevValue = form[name as keyof typeof form] as string;
    if (value.length < prevValue.length) {
      setForm({ ...form, [name]: value });
      return;
    }
    let v = value.replace(/\D/g, '');
    if (v.length >= 1 && parseInt(v[0]) > 2) v = '2';
    if (v.length >= 2) {
      const hour = parseInt(v.slice(0, 2));
      if (hour > 23) v = '23' + v.slice(2);
    }
    if (v.length >= 3) {
      const minDecena = parseInt(v[2]);
      if (minDecena > 5) v = v.slice(0, 2) + '5';
    }
    let formatted = v;
    if (v.length >= 3) {
      formatted = v.slice(0, 2) + ':' + v.slice(2, 4);
    } else {
      formatted = v.slice(0, 2);
    }
    setForm({ ...form, [name]: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.workingDays.length === 0) {
      alert("Debes seleccionar al menos un día de trabajo");
      return;
    }

    try {
      const token = localStorage.getItem('jwt_token');
      const payload = {
        ...form,
        slotDurationMinutes: 60,
        workingDays: form.workingDays.join(','),
        ownerId: ownerId,
      };

      const res = await fetch(`${API_URL}/workshops`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Taller creado con éxito.");
      onClose();
      setForm({
        cif: '',
        companyName: '',
        address: '',
        workingDays: [],
        openTime: '09:00',
        closeTime: '18:00',
      });
      onSuccess();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300" onClick={onClose}></div>
      
      <div className="relative bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-300">
         <div className="flex flex-col h-full max-h-[90vh]">
             <div className="relative p-6 px-8 border-b border-neutral-800/50 bg-neutral-950/50 flex justify-between items-center z-10 shrink-0">
               <div>
                 <h2 className="text-white text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                   Nuevo Taller
                   <span className="flex h-2 w-2 relative">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                   </span>
                 </h2>
                 <p className="text-[10px] text-neutral-500 font-mono mt-1 uppercase">Configuración de Negocio</p>
               </div>
               <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>

             <div className="absolute inset-0 pointer-events-none overflow-hidden object-cover">
                <div className="absolute -top-[40%] -right-[40%] w-full h-full bg-red-600/5 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
             </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
               <form onSubmit={handleSubmit} className="space-y-8">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest text-neutral-500 uppercase block ml-1">Nombre Comercial *</label>
                        <input type="text" required value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} className="w-full bg-neutral-900/50 border border-neutral-800 text-white p-4 rounded-2xl focus:outline-none focus:border-red-600 transition-all font-bold placeholder-neutral-700" placeholder="Ej. Talleres Motosport" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest text-neutral-500 uppercase block ml-1">CIF *</label>
                        <input type="text" required value={form.cif} onChange={e => setForm({...form, cif: e.target.value})} className="w-full bg-neutral-900/50 border border-neutral-800 text-white p-4 rounded-2xl focus:outline-none focus:border-red-600 transition-all font-mono font-bold placeholder-neutral-700" placeholder="B12345678" />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black tracking-widest text-neutral-500 uppercase block ml-1">Sede Física (Dirección) *</label>
                     <input type="text" required value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full bg-neutral-900/50 border border-neutral-800 text-white p-4 rounded-2xl focus:outline-none focus:border-red-600 transition-all font-bold placeholder-neutral-700" placeholder="C/ Gran Vía 12, Madrid" />
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black tracking-widest text-neutral-500 uppercase block ml-1">Días Operativos *</label>
                     <div className="flex flex-wrap gap-2">
                        {diasSemana.map(dia => (
                           <button 
                              type="button" 
                              key={dia.value}
                              onClick={() => handleDiasCambio(dia.value)}
                              className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border ${form.workingDays.includes(dia.value) ? 'bg-red-600/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-700'}`}
                           >
                              {dia.label}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest text-neutral-500 uppercase block ml-1">Apertura (HH:mm)</label>
                        <input type="text" name="openTime" required value={form.openTime} onChange={handleTimeChange} className="w-full bg-neutral-900/50 border border-neutral-800 text-white p-4 rounded-2xl focus:outline-none focus:border-red-600 transition-all text-center font-mono text-xl font-bold" maxLength={5} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest text-neutral-500 uppercase block ml-1">Cierre (HH:mm)</label>
                        <input type="text" name="closeTime" required value={form.closeTime} onChange={handleTimeChange} className="w-full bg-neutral-900/50 border border-neutral-800 text-white p-4 rounded-2xl focus:outline-none focus:border-red-600 transition-all text-center font-mono text-xl font-bold" maxLength={5} />
                     </div>
                  </div>

                  <button type="submit" className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-black italic uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all flex justify-center items-center gap-3 group active:scale-[0.98]">
                     Activar Taller
                     <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </button>
               </form>
            </div>
         </div>
      </div>
    </div>
  );
}
