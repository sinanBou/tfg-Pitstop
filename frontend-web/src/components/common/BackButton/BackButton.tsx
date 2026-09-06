import React from 'react';
import type { BackButtonProps } from './BackButton.types';
import { ChevronLeft } from '@/assets/icons';

/**
 * Componente de botón de retorno ("atrás") circular o cuadrado con chevron.
 * Admite estados activos, animaciones de micro-desplazamiento y un dot opcional.
 */
export const BackButton: React.FC<BackButtonProps> = ({ 
  onClick, 
  title = 'Volver',
  theme = 'blue',
  showDot = false
}) => {
  const hoverBorderColor = theme === 'red' ? 'hover:border-red-600/50' : 'hover:border-blue-600/50';
  const dotColor = theme === 'red' ? 'bg-red-600' : 'bg-blue-600';

  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900/60 dark:hover:bg-neutral-800 border border-slate-300 dark:border-neutral-800/80 flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white transition-all active:scale-95 shadow-sm dark:shadow-inner group relative cursor-pointer ${hoverBorderColor}`}
      title={title}
    >
      {showDot && (
        <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full opacity-60 group-hover:opacity-100 transition-opacity ${dotColor}`} />
      )}
      
      <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
    </button>
  );
};
