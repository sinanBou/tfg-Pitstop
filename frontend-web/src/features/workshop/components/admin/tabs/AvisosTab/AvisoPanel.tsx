import React from 'react';
import { Card } from '@/components/common/Card/Card';
import { Badge } from '@/components/common/Badge/Badge';
import { CheckCircle } from '@/assets/icons';

interface AvisoPanelProps {
  title: string;
  badgeCount: number;
  badgeVariant?: 'warning' | 'danger' | 'neutral';
  indicatorColor?: string;
  borderColor?: string;
  isEmpty: boolean;
  emptyStateMessage: string;
  emptyStateIcon?: React.ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  children: React.ReactNode;
}

export const AvisoPanel: React.FC<AvisoPanelProps> = ({
  title,
  badgeCount,
  badgeVariant = 'neutral',
  indicatorColor = 'bg-neutral-500',
  borderColor = 'border-neutral-800/60',
  isEmpty,
  emptyStateMessage,
  emptyStateIcon,
  isLoading = false,
  loadingMessage = 'Cargando...',
  children,
}) => {
  return (
    <Card 
      variant="neutral" 
      glow={false} 
      padding="lg" 
      className={`border border-slate-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/30 shadow-sm dark:shadow-none !rounded-2xl flex flex-col min-h-[460px] ${borderColor}`}
    >
      {/* Cabecera del Panel */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-neutral-800/60 pb-6 mb-6">
        <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-wider text-xs flex items-center gap-2.5">
          <span className={`w-2 h-2 ${indicatorColor} rounded-full animate-pulse`}></span>
          {title}
          <Badge variant={badgeVariant}>{badgeCount}</Badge>
        </h3>
      </div>

      {/* Cuerpo del Panel */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-500 dark:text-neutral-500 flex flex-col items-center justify-center gap-3">
          <div className={`w-6 h-6 border-2 border-slate-300 dark:border-neutral-800 border-t-red-500 rounded-full animate-spin`} />
          <span className="text-[10px] uppercase tracking-widest font-black">
            {loadingMessage}
          </span>
        </div>
      ) : isEmpty ? (
        <div className="flex-1 py-16 text-center text-slate-500 dark:text-neutral-500 text-[10px] uppercase tracking-widest font-black border border-dashed border-slate-200 dark:border-neutral-800/60 rounded-2xl flex flex-col items-center justify-center gap-3 bg-slate-100/50 dark:bg-black/10">
          {emptyStateIcon || (
            <CheckCircle className="w-8 h-8 text-slate-400 dark:text-neutral-700" strokeWidth={1.5} />
          )}
          <span>{emptyStateMessage}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4 flex-1 overflow-y-auto max-h-[580px] pr-1.5 custom-scrollbar">
          {children}
        </div>
      )}
    </Card>
  );
};
