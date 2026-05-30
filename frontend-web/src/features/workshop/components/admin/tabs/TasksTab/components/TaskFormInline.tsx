import React from 'react';
import { InputField } from '@/components/common/InputField/InputField';

interface TaskFormInlineProps {
  title: string;
  submitLabel: string;
  name: string;
  setName: (val: string) => void;
  calcType: 'fixed' | 'cylinder' | 'wheel';
  setCalcType: (val: 'fixed' | 'cylinder' | 'wheel') => void;
  hours: string;
  setHours: (val: string) => void;
  hours4Cil: string;
  setHours4Cil: (val: string) => void;
  hoursCilExtra: string;
  setHoursCilExtra: (val: string) => void;
  hours1Rueda: string;
  setHours1Rueda: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitting: boolean;
}

export const TaskFormInline: React.FC<TaskFormInlineProps> = ({
  title,
  submitLabel,
  name,
  setName,
  calcType,
  setCalcType,
  hours,
  setHours,
  hours4Cil,
  setHours4Cil,
  hoursCilExtra,
  setHoursCilExtra,
  hours1Rueda,
  setHours1Rueda,
  onSubmit,
  onCancel,
  submitting
}) => {
  return (
    <form onSubmit={onSubmit} className="p-5 bg-neutral-950 border border-neutral-800/40 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300">
      <p className="text-xs font-black text-blue-400 uppercase tracking-widest">{title}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Nombre de la tarea"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ej: Reparar radiador exterior, Carga de refrigerante..."
        />
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest ml-1 mb-0.5">Tipo de Cálculo de Tiempo</label>
          <select
            value={calcType}
            onChange={e => setCalcType(e.target.value as any)}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-blue-500/50 transition-all font-semibold cursor-pointer"
          >
            <option value="fixed">Fijo (Tiempo determinado)</option>
            <option value="cylinder">Por Cilindros (Coches/Motores)</option>
            <option value="wheel">Por Ruedas (Neumáticos)</option>
          </select>
        </div>
      </div>

      <div className="p-4 bg-neutral-900/40 border border-neutral-800/30 rounded-xl">
        {calcType === 'fixed' && (
          <div className="max-w-[200px]">
            <InputField
              label="Horas Estimadas Fijas"
              type="number"
              step="0.05"
              required
              value={hours}
              onChange={e => setHours(e.target.value)}
              mono
            />
          </div>
        )}
        {calcType === 'cylinder' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Horas Base (4 Cilindros)"
              type="number"
              step="0.05"
              required
              value={hours4Cil}
              onChange={e => setHours4Cil(e.target.value)}
              mono
            />
            <InputField
              label="Horas Extra por Cilindro Adicional"
              type="number"
              step="0.05"
              value={hoursCilExtra}
              onChange={e => setHoursCilExtra(e.target.value)}
              placeholder="Opcional (Ej: 0.25)"
              mono
            />
          </div>
        )}
        {calcType === 'wheel' && (
          <div className="max-w-[200px]">
            <InputField
              label="Horas por Rueda"
              type="number"
              step="0.05"
              required
              value={hours1Rueda}
              onChange={e => setHours1Rueda(e.target.value)}
              mono
            />
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-3 rounded-xl border border-neutral-800 hover:border-neutral-700 text-xs font-bold uppercase tracking-wider text-neutral-400 transition-all cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-black uppercase tracking-wider text-white transition-all disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Procesando...' : submitLabel}
        </button>
      </div>
    </form>
  );
};
