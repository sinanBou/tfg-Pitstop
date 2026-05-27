import React from 'react';
import { Card } from '@/components/common/Card';

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
      className="relative overflow-hidden group select-none hover:border-neutral-800 transition-all duration-300 !rounded-2xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase font-extrabold tracking-wider text-white">
            {title}
          </p>
          {icon && <div className="text-neutral-600 group-hover:text-neutral-400 transition-colors duration-300">{icon}</div>}
        </div>
        <div className={`text-2xl font-black font-mono tracking-tighter ${alert ? 'text-red-500' : 'text-white'}`}>
          {value}
        </div>
      </div>
    </Card>
  );
};
