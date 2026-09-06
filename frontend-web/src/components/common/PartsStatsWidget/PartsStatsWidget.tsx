import React from 'react';
import type { PartsStatsWidgetProps } from './PartsStatsWidget.types';

export const PartsStatsWidget: React.FC<PartsStatsWidgetProps> = ({ partsCost, partsSold }) => {
  const margin = partsSold > 0 ? ((partsSold - partsCost) / partsSold) * 100 : 0;

  return (
    <div className="bg-white/90 dark:bg-neutral-900/80 rounded-2xl p-6 space-y-4 shadow-sm select-none border border-slate-200 dark:border-neutral-800/40">
      <div className="border-b border-slate-200 dark:border-neutral-800/40 pb-3">
        <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
          Repuestos y Materiales
        </h4>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Cost price */}
        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-neutral-400 block">
            Costo de Adquisición
          </span>
          <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
            {partsCost.toFixed(2)}€
          </span>
        </div>

        {/* Retail selling price */}
        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-neutral-400 block">
            Precio de Venta
          </span>
          <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
            {partsSold.toFixed(2)}€
          </span>
        </div>
      </div>

      {/* margin info */}
      <div className="bg-slate-100 dark:bg-black/20 rounded-xl p-3 flex justify-between items-center text-xs border border-slate-200 dark:border-neutral-800/20">
        <span className="font-mono text-slate-500 dark:text-neutral-400">Rendimiento Estimado:</span>
        <span className={`font-mono font-bold ${margin >= 0 ? 'text-slate-700 dark:text-neutral-300' : 'text-red-500'}`}>
          +{margin.toFixed(1)}% ({ (partsSold - partsCost).toFixed(2) }€ de margen)
        </span>
      </div>
    </div>
  );
};
