import React from 'react';
import type { InputFieldProps } from './InputField.types';

export const InputField: React.FC<InputFieldProps> = ({
  label,
  multiline = false,
  rows = 3,
  error,
  mono = false,
  className = '',
  id,
  required,
  focusVariant = 'red',
  ...props
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}`;
  
  const focusStyles = {
    red: 'focus:border-red-500/50',
    blue: 'focus:border-blue-500/50',
    emerald: 'focus:border-emerald-500/50',
    neutral: 'focus:border-neutral-700'
  };

  const baseInputStyles = `w-full bg-neutral-950 border rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:bg-black/40 transition-all font-semibold ${
    focusStyles[focusVariant]
  } ${
    error ? 'border-red-500/50' : 'border-neutral-800'
  }`;
  
  const labelStyles = `text-[9px] font-black uppercase tracking-widest text-neutral-500 ml-1 block mb-1.5`;

  return (
    <div className={`flex flex-col w-full ${className}`}>
      <label htmlFor={inputId} className={labelStyles}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {multiline ? (
        <textarea
          id={inputId}
          rows={rows}
          required={required}
          className={`${baseInputStyles} resize-none`}
          {...(props as any)}
        />
      ) : (
        <input
          id={inputId}
          type={props.type || 'text'}
          required={required}
          className={`${baseInputStyles} ${mono ? 'font-mono' : ''}`}
          {...props}
        />
      )}
      {error && (
        <span className="text-red-500 text-[9px] font-black uppercase tracking-widest mt-1.5 ml-1 animate-in fade-in duration-200">
          {error}
        </span>
      )}
    </div>
  );
};
