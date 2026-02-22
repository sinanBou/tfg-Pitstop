import React from 'react';

interface InputGroupProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
}

export default function InputGroup({ 
  label, name, type = "text", value, onChange, error, placeholder 
}: InputGroupProps) {
  return (
    <div className="w-full">
      <label className="block text-gray-400 text-xs font-bold mb-1 ml-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-black border rounded-lg p-3 text-white text-sm focus:outline-none transition-colors ${
          error ? 'border-red-500' : 'border-neutral-700 focus:border-white'
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{error}</p>}
    </div>
  );
}