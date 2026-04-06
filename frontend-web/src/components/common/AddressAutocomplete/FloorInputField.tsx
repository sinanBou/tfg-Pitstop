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
      className="w-full bg-neutral-900/50 backdrop-blur-sm rounded-xl p-4 text-white font-medium outline-none transition-all placeholder-neutral-600 border border-neutral-800 hover:border-neutral-700 focus:border-red-500 focus:bg-black/80"
    />
  </div>
);
