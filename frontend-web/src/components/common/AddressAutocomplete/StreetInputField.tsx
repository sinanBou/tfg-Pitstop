import React from 'react';

interface StreetInputFieldProps {
  value: string;
  onChange: (val: string) => void;
  isLoading: boolean;
  onFocus: () => void;
  placeholder?: string;
  error?: boolean;
}

export const StreetInputField: React.FC<StreetInputFieldProps> = ({ 
  value, onChange, isLoading, onFocus, placeholder, error 
}) => (
  <div className="relative flex-1">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      placeholder={placeholder}
      className={`w-full bg-neutral-950 rounded-xl px-4 py-3 text-white text-xs font-semibold outline-none transition-all placeholder-neutral-600 border ${
        error ? 'border-red-500/50 focus:border-red-500/50' : 'border-neutral-800 focus:border-red-500/50 focus:bg-black/40'
      }`}
    />
    {isLoading && (
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    )}
  </div>
);
