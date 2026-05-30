import React from 'react';
import type { ProgressBarProps } from './ProgressBar.types';

export const ProgressBar: React.FC<ProgressBarProps> = ({ label, sublabel, valueText, percentage }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
        <div>
          <span className="font-black uppercase text-neutral-200">{label}</span>
          {sublabel && <span className="text-[9px] text-neutral-500 font-mono block mt-0.5">{sublabel}</span>}
        </div>
        <span className="font-black font-mono text-neutral-300">{valueText}</span>
      </div>
      <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800/40">
        <div 
          className="h-full bg-red-600 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};
