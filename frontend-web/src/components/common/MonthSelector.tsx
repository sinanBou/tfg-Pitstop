import React from 'react';

interface MonthSelectorProps {
  selectedMonth: string; // 'all' | '01' | '02' | ... | '12'
  onChange: (month: string) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({ selectedMonth, onChange }) => {
  const months = [
    { value: 'all', label: 'Todo el Histórico' },
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="month-select" className="text-[10px] font-black uppercase tracking-widest text-neutral-500 font-mono">
        Filtrar Periodo:
      </label>
      <select
        id="month-select"
        value={selectedMonth}
        onChange={(e) => onChange(e.target.value)}
        className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600 transition-all font-mono"
      >
        {months.map(m => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
};
