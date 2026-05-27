import React, { useState } from 'react';
import AddressAutocomplete from '@/components/common/AddressAutocomplete';
import { BaseModal } from '@/components/common/BaseModal';

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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Taller"
      subtitle="Configuración de Negocio"
      theme="red"
    >
      <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row gap-6 items-start flex-1">
          {/* Datos del Negocio (Izquierda) */}
          <div className="w-full md:w-1/2 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-widest text-neutral-500 uppercase block ml-1">Nombre Comercial *</label>
              <input 
                type="text" 
                required 
                value={form.companyName} 
                onChange={e => setForm({...form, companyName: e.target.value})} 
                className="w-full bg-neutral-900/50 border border-neutral-800 text-white p-4 rounded-2xl focus:outline-none focus:border-red-600 transition-all font-bold placeholder-neutral-700" 
                placeholder="Ej. Talleres Motosport" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-widest text-neutral-500 uppercase block ml-1">CIF *</label>
              <input 
                type="text" 
                required 
                value={form.cif} 
                onChange={e => setForm({...form, cif: e.target.value})} 
                className="w-full bg-neutral-900/50 border border-neutral-800 text-white p-4 rounded-2xl focus:outline-none focus:border-red-600 transition-all font-mono font-bold placeholder-neutral-700" 
                placeholder="B12345678" 
              />
            </div>

            <div className="space-y-2">
              <AddressAutocomplete 
                label="Sede Física (Dirección) *" 
                name="address" 
                value={form.address} 
                onChange={(val: string) => setForm({...form, address: val})} 
                placeholder="Calle, Número, Ciudad..." 
              />
            </div>
          </div>

          {/* Horario y Días (Derecha) */}
          <div className="w-full md:w-1/2 space-y-4">
            <div className="space-y-3">
              <label className="text-[10px] font-black tracking-widest text-neutral-500 uppercase block ml-1">Días Operativos *</label>
              <div className="flex flex-wrap gap-2">
                {diasSemana.map(dia => (
                  <button 
                    type="button" 
                    key={dia.value}
                    onClick={() => handleDiasCambio(dia.value)}
                    className={`px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${
                      form.workingDays.includes(dia.value) 
                        ? 'bg-red-600/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]' 
                        : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-700'
                    }`}
                  >
                    {dia.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest text-neutral-500 uppercase block ml-1">Apertura (HH:mm)</label>
                <input 
                  type="text" 
                  name="openTime" 
                  required 
                  value={form.openTime} 
                  onChange={handleTimeChange} 
                  className="w-full bg-neutral-900/50 border border-neutral-800 text-white p-4 rounded-2xl focus:outline-none focus:border-red-600 transition-all text-center font-mono text-xl font-bold" 
                  maxLength={5} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest text-neutral-500 uppercase block ml-1">Cierre (HH:mm)</label>
                <input 
                  type="text" 
                  name="closeTime" 
                  required 
                  value={form.closeTime} 
                  onChange={handleTimeChange} 
                  className="w-full bg-neutral-900/50 border border-neutral-800 text-white p-4 rounded-2xl focus:outline-none focus:border-red-600 transition-all text-center font-mono text-xl font-bold" 
                  maxLength={5} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-6 border-t border-neutral-800/50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 rounded-xl border border-neutral-800 hover:border-neutral-700 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-black uppercase tracking-widest text-white transition-all flex items-center gap-2 active:scale-95 shadow-[0_0_30px_rgba(220,38,38,0.3)]"
          >
            Activar Taller
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
