import React from 'react';
import type { ProgressBarProps } from './ProgressBar.types';

/**
 * Componente común de barra de progreso lineal.
 * Muestra el progreso actual con animación CSS, etiquetas explicativas y valores descriptivos a la derecha.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({ label, sublabel, valueText, percentage }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
        <div>
          <span className="font-black uppercase text-slate-800 dark:text-neutral-200">{label}</span>
          {sublabel && <span className="text-[9px] text-slate-500 dark:text-neutral-500 font-mono block mt-0.5">{sublabel}</span>}
        </div>
        <span className="font-black font-mono text-slate-700 dark:text-neutral-300">{valueText}</span>
      </div>
      <div className="w-full h-2 bg-slate-200 dark:bg-neutral-900 rounded-full overflow-hidden border border-slate-300 dark:border-neutral-800/40">
        <div 
          className="h-full bg-red-600 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};
