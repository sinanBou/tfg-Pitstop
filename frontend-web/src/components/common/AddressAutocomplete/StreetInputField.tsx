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
      className={`w-full bg-neutral-900/50 backdrop-blur-sm rounded-xl p-4 text-white font-medium outline-none transition-all placeholder-neutral-600 border ${
        error ? 'border-red-500 focus:border-red-500' : 'border-neutral-800 hover:border-neutral-700 focus:border-white focus:bg-black/80'
      }`}
    />
    {isLoading && (
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    )}
  </div>
);
