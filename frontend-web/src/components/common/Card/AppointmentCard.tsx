import React from 'react';
import { Card } from './Card';

interface AppointmentCardProps {
  type: string;
  dateTime: string;
  description?: string;
  status?: string;
  variant?: 'red' | 'blue';
  onClick?: () => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  type, dateTime, description, status, variant = 'red', onClick 
}) => {
  const dateObj = new Date(dateTime);
  
  return (
    <Card 
      variant={variant} 
      padding="none" 
      onClick={onClick}
      className="p-6 hover:border-red-500/40 group relative overflow-hidden flex flex-col"
    >
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${variant === 'red' ? 'text-red-500' : 'text-blue-400'}`}>
               {type}
            </div>
            <div className="text-white font-black text-xl tracking-tight uppercase">
              {dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}h
            </div>
          </div>
          {status && (
            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${variant === 'red' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
              {status}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-mono text-neutral-500 uppercase flex items-center gap-1.5 font-bold">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })}
          </div>
          {description && <div className="text-xs text-neutral-400 font-medium line-clamp-1 italic mt-2 opacity-80 group-hover:opacity-100 transition-opacity">"{description}"</div>}
        </div>
      </div>
    </Card>
  );
};
