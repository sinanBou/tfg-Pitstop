import React from 'react';
import { Card } from '@/components/common/Card/Card';
import { getBrandLogo } from '@/components/common/SearchableSelect/BrandLogos';

interface AppointmentCardProps {
  type: string;
  dateTime: string;
  description?: string;
  status?: string;
  variant?: 'red' | 'blue';
  vehicleDisplay?: string;
  clientName?: string;
  onClick?: () => void;
  isCompact?: boolean;
  serviceType?: string;
  completedTasks?: string;
  estimatedDuration?: number;
  vehicleReceived?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  type, dateTime, description, status, variant = 'red', vehicleDisplay, clientName, onClick, isCompact = false,
  serviceType, completedTasks, estimatedDuration, vehicleReceived
}) => {
  const dateObj = new Date(dateTime);
  
  return (
    <Card 
      variant={variant} 
      padding="none" 
      onClick={onClick}
      rounded="2xl"
      className={`w-full h-full hover:border-red-500/40 group relative overflow-hidden flex flex-col justify-start ${isCompact ? 'p-4 pt-5' : 'p-6 justify-center'}`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      </div>

      <div className={`relative flex-1 ${isCompact ? 'flex flex-col justify-start' : 'space-y-4'}`}>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className={`flex items-center justify-between gap-2 ${isCompact ? 'mb-0' : 'mb-1'}`}>
                <div className={`flex items-center gap-2 overflow-hidden ${isCompact ? 'flex-wrap' : ''}`}>
                   <div className={`text-[11px] font-black uppercase tracking-[0.2em] shrink-0 ${variant === 'red' ? 'text-red-500' : 'text-blue-400'}`}>
                      {type}
                   </div>
                   {clientName && (
                      <div className="text-[10px] text-neutral-400 font-bold uppercase truncate min-w-0 border-l border-neutral-700 pl-2" title={clientName}>
                        {clientName}
                      </div>
                   )}
                </div>
                 {isCompact && (
                   <span className="text-white text-[12px] font-black shrink-0">
                      {dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}
                   </span>
                )}
            </div>

            {vehicleDisplay && (
               <div className={`text-white font-black tracking-tight uppercase leading-none truncate flex items-center gap-2 ${isCompact ? 'text-[14px] mt-1' : 'text-lg mb-1'}`}>
                 <span className={`shrink-0 flex items-center justify-center ${isCompact ? '[&_svg]:w-4 [&_svg]:h-4 [&_div]:w-4 [&_div]:h-4 [&_div]:text-[8px]' : '[&_svg]:w-5 [&_svg]:h-5 [&_div]:w-5 [&_div]:h-5 [&_div]:text-[9px]'}`}>
                   {getBrandLogo(vehicleDisplay.split(' ')[0])}
                 </span>
                 <span>{vehicleDisplay}</span>
               </div>
            )}

            {(() => {
              const totalTasksList = (serviceType || '').split(',').map(c => c.trim()).filter(Boolean);
              const completedTasksList = (completedTasks || '').split(',').map(c => c.trim()).filter(Boolean);
              const hasTasks = totalTasksList.length > 0;
              if (!hasTasks) return null;
              
              return (
                <div className="mt-2 flex items-center gap-1.5">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                    completedTasksList.length === totalTasksList.length 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}>
                    {completedTasksList.length}/{totalTasksList.length} Tareas
                  </span>
                </div>
              );
            })()}

            {!isCompact && (
                <div className="text-white font-black text-xl tracking-tight uppercase mt-1">
                  {dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}
                </div>
            )}
          </div>

          {status && !isCompact && (
            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0 ${variant === 'red' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
              {status}
            </div>
          )}
        </div>

        {/* Compact: info row with duration + reception status + description */}
        {isCompact && (
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {estimatedDuration && (
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-neutral-300 font-mono shrink-0">
                {estimatedDuration >= 60 ? `${Math.floor(estimatedDuration / 60)}h${estimatedDuration % 60 > 0 ? ` ${estimatedDuration % 60}m` : ''}` : `${estimatedDuration}m`}
              </span>
            )}
            {vehicleReceived === false && (
              <span className="text-[7px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                Sin recep.
              </span>
            )}
            {vehicleReceived === true && (
              <span className="text-[7px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                En taller
              </span>
            )}
            {description && (
              <span className="text-[8px] text-neutral-500 italic truncate min-w-0">
                {description}
              </span>
            )}
          </div>
        )}

        {!isCompact && (
           <div className="flex flex-col gap-1">
             <div className="text-[10px] font-mono text-neutral-500 uppercase flex items-center gap-1.5 font-bold">
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
               {dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })}
             </div>
             {description && <div className="text-xs text-neutral-400 font-medium line-clamp-1 italic mt-1 opacity-80 group-hover:opacity-100 transition-opacity">"{description}"</div>}
           </div>
        )}
      </div>
    </Card>
  );
};
