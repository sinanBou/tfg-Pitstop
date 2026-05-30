import React from 'react';
import type { MetricCardProps } from './MetricCard.types';

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, subtext }) => {
  return (
    <div className="bg-neutral-900/80 rounded-2xl p-6 space-y-2 select-none shadow-sm relative overflow-hidden group hover:bg-neutral-900/90 transition-all duration-300 border border-neutral-800/40 hover:border-neutral-700/60">
      <p className="text-xs font-black uppercase tracking-wider text-neutral-400">
        {label}
      </p>
      <p className="text-2xl font-black font-mono text-white tracking-tight">
        {value}
      </p>
      {subtext && (
        <p className="text-[10px] font-mono text-neutral-400">
          {subtext}
        </p>
      )}
    </div>
  );
};
