import React from 'react';
import { Card } from '@/components/common/Card/Card';
import { Badge } from '@/components/common/Badge/Badge';

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
      className={`${borderColor} flex flex-col min-h-[460px]`}
    >
      {/* Cabecera del Panel */}
      <div className="flex items-center justify-between border-b border-neutral-800/60 pb-6 mb-6">
        <h3 className="text-white font-black uppercase tracking-wider text-xs flex items-center gap-2.5">
          <span className={`w-2 h-2 ${indicatorColor} rounded-full animate-pulse`}></span>
          {title}
          <Badge variant={badgeVariant}>{badgeCount}</Badge>
        </h3>
      </div>

      {/* Cuerpo del Panel */}
      {isLoading ? (
        <div className="py-16 text-center text-neutral-500 flex flex-col items-center justify-center gap-3">
          <div className={`w-6 h-6 border-2 border-neutral-800 border-t-red-500 rounded-full animate-spin`} />
          <span className="text-[10px] uppercase tracking-widest font-black">
            {loadingMessage}
          </span>
        </div>
      ) : isEmpty ? (
        <div className="flex-1 py-16 text-center text-neutral-500 text-[10px] uppercase tracking-widest font-black border border-dashed border-neutral-800/60 rounded-2xl flex flex-col items-center justify-center gap-3 bg-black/10">
          {emptyStateIcon || (
            <svg className="w-8 h-8 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
