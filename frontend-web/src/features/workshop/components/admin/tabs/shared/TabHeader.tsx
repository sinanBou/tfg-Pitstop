import React from 'react';
import { Plus } from '@/assets/icons';

interface TabHeaderProps {
  title: string;
  subtitle: string;
  actionLabel: string;
  onActionClick: () => void;
  colorVariant?: 'red' | 'blue';
}

export const TabHeader: React.FC<TabHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onActionClick,
  colorVariant = 'red'
}) => {
  const gradientClass = colorVariant === 'red'
    ? 'from-red-600 to-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]'
    : 'from-blue-600 to-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]';

  return (
    <div className="flex justify-between items-center bg-neutral-900/80 border border-neutral-800/40 rounded-2xl p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-white">{title}</h2>
        <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">{subtitle}</p>
      </div>
      <button
        onClick={onActionClick}
        className={`px-5 py-3 rounded-2xl bg-gradient-to-r text-xs font-black uppercase tracking-wider hover:scale-[1.02] transition-all active:scale-95 flex items-center gap-2 cursor-pointer text-white ${gradientClass}`}
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        {actionLabel}
      </button>
    </div>
  );
};
