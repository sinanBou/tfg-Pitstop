import React from 'react';
import { Card } from '@/components/common/Card/Card';

interface AvisoMetricCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  alert?: boolean;
}

export const AvisoMetricCard: React.FC<AvisoMetricCardProps> = ({
  title,
  value,
  icon,
  alert = false,
}) => {
  return (
    <Card 
      variant="neutral" 
      glow={false} 
      padding="sm"
      className="relative overflow-hidden group select-none hover:border-slate-300 dark:hover:border-neutral-700 transition-all duration-300 !rounded-2xl border border-slate-200 dark:border-neutral-800/80 shadow-sm dark:shadow-none bg-white dark:bg-neutral-900/30"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase font-extrabold tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
            {alert && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />}
            {title}
          </p>
          {icon && <div className="text-slate-400 group-hover:text-slate-600 dark:text-neutral-600 dark:group-hover:text-neutral-400 transition-colors duration-300">{icon}</div>}
        </div>
        <div className={`text-2xl font-black font-mono tracking-tighter ${alert ? 'text-red-600 dark:text-red-500' : 'text-slate-900 dark:text-white'}`}>
          {value}
        </div>
      </div>
    </Card>
  );
};
