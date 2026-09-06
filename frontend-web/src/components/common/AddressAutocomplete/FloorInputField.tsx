import React from 'react';

interface FloorInputFieldProps {
  value: string;
  onChange: (val: string) => void;
}

export const FloorInputField: React.FC<FloorInputFieldProps> = ({ value, onChange }) => (
  <div className="w-1/3 max-w-[120px]">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Piso/Pta"
      className="w-full bg-slate-100 dark:bg-neutral-950 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-semibold outline-none transition-all placeholder-slate-400 dark:placeholder-neutral-600 border border-slate-300 dark:border-neutral-800 focus:border-red-500/50 focus:bg-slate-50 dark:focus:bg-black/40"
    />
  </div>
);
