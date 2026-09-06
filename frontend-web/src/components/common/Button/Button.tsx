import React from 'react';
import type { ButtonProps } from './Button.types';

/**
 * Componente de botón de interacción común del sistema.
 * Implementa la estética premium industrial de PitStop, con transiciones y micro-interacciones hover.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  glow = true,
  className = '',
  type = 'button',
  ...props
}) => {
  const baseStyles = 'px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all duration-300 select-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none';
  
  const hasCustomBg = /(?:^|\s)(?:!?)(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent|\[#))/i.test(className);
  const hasCustomText = /(?:^|\s)(?:!?)(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent|\[#))/i.test(className);
  const hasCustomBorder = /(?:^|\s)(?:!?)(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent|\[#))/i.test(className);

  let variantStyles = '';
  if (variant === 'primary') {
    const bg = hasCustomBg ? '' : 'bg-red-600 hover:bg-red-500';
    const text = hasCustomText ? '' : 'text-white';
    const border = hasCustomBorder ? '' : 'border border-transparent';
    const shadow = 'shadow-sm dark:shadow-[0_0_20px_rgba(220,38,38,0.2)]';
    variantStyles = `${bg} ${text} ${border} ${shadow}`.trim();
  } else if (variant === 'secondary') {
    const bg = hasCustomBg ? '' : 'bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800';
    const text = hasCustomText ? '' : 'text-slate-800 hover:text-slate-900 dark:text-neutral-300 dark:hover:text-white';
    const border = hasCustomBorder ? '' : 'border border-slate-300 dark:border-neutral-850 dark:hover:border-neutral-700';
    const shadow = 'shadow-sm dark:shadow-none';
    variantStyles = `${bg} ${text} ${border} ${shadow}`.trim();
  } else if (variant === 'danger') {
    const bg = hasCustomBg ? '' : 'bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/40';
    const text = hasCustomText ? '' : 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300';
    const border = hasCustomBorder ? '' : 'border border-red-200 dark:border-red-500/20 dark:hover:border-red-500/40';
    variantStyles = `${bg} ${text} ${border}`.trim();
  } else if (variant === 'ghost') {
    const bg = hasCustomBg ? '' : 'bg-transparent hover:bg-slate-100 dark:hover:bg-white/5';
    const text = hasCustomText ? '' : 'text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white';
    const border = hasCustomBorder ? '' : 'border border-slate-200 dark:border-neutral-800 dark:hover:border-neutral-700';
    variantStyles = `${bg} ${text} ${border}`.trim();
  } else if (variant === 'custom') {
    variantStyles = '';
  }

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles} ${className}`.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </button>
  );
};
