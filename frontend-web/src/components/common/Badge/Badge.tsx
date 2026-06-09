import React from 'react';
import type { BadgeProps } from './Badge.types';

/**
 * Componente de etiqueta o chapa (Badge) para indicar estados.
 * Diseñado con tipografía monoespacio en mayúsculas, bordes sutiles y transparencias en fondos.
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border select-none h-fit';
  
  const variants = {
    primary: 'bg-red-500/10 text-red-500 border-red-500/20',
    secondary: 'bg-white/5 text-white border-white/10',
    danger: 'bg-red-950/40 text-red-400 border-red-500/20',
    neutral: 'bg-neutral-800/80 text-neutral-300 border-neutral-750',
    warning: 'bg-neutral-900 text-neutral-400 border-neutral-800',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
