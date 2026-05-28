import React from 'react';
import { getBrandLogo } from '@/components/common/SearchableSelect/BrandLogos';

interface WorkshopVehicleCardProps {
  vehicle: any;
}

export const WorkshopVehicleCard: React.FC<WorkshopVehicleCardProps> = ({ vehicle }) => {
  const getProgressWidth = (status: string) => {
    switch (status) {
      case 'PENDING': return '10%';
      case 'CONFIRMED': return '30%';
      case 'IN_PROGRESS': return '65%';
      case 'DELAYED': return '65%';
      case 'COMPLETED': return '100%';
      default: return '0%';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'CONFIRMED': return 'Confirmado';
      case 'IN_PROGRESS': return 'En Curso';
      case 'DELAYED': return 'Retrasado';
      case 'COMPLETED': return 'Listo para Recoger';
      default: return status.replace('_', ' ');
    }
  };

  const getThemeColors = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          badge: 'bg-green-500/10 border-green-500/20 text-green-400',
          ping: 'bg-green-500',
          gradient: 'from-blue-600 to-sky-400',
          border: 'border-blue-500/50 hover:border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
          text: 'text-green-400',
        };
      case 'DELAYED':
        return {
          badge: 'bg-red-500/10 border-red-500/20 text-red-400',
          ping: 'bg-red-500',
          gradient: 'from-blue-600 to-sky-400',
          border: 'border-blue-500/50 hover:border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
          text: 'text-red-400',
        };
      case 'IN_PROGRESS':
        return {
          badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
          ping: 'bg-blue-500',
          gradient: 'from-blue-600 to-sky-400',
          border: 'border-blue-500/50 hover:border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
          text: 'text-blue-400',
        };
      default:
        return {
          badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          ping: 'bg-amber-500',
          gradient: 'from-blue-600 to-sky-400',
          border: 'border-blue-500/50 hover:border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
          text: 'text-amber-400',
        };
    }
  };

  const colors = getThemeColors(vehicle.status);

  return (
    <div className={`bg-gradient-to-br from-neutral-900/80 to-black border ${colors.border} p-5 rounded-2xl relative overflow-hidden group transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 w-[280px] h-[200px] shrink-0`}>
      {/* Icono de Fondo */}
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-110 group-hover:-rotate-3 duration-500 pointer-events-none">
        <svg className="w-24 h-24 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,rgba(59,130,246,0.05)_50%,transparent_100%)] group-hover:animate-[shimmer_2s_infinite] -skew-x-12 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col justify-between h-full gap-3">
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className={`flex items-center gap-1.5 ${colors.badge} px-2.5 py-1 rounded-full inline-flex`}>
              <span className="relative flex h-1.5 w-1.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors.ping} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${colors.ping}`}></span>
              </span>
              <p className="text-[8px] font-black uppercase tracking-[0.2em]">{getStatusLabel(vehicle.status)}</p>
            </div>
            <span className="text-[11px] font-mono font-bold text-neutral-300 bg-neutral-950/80 px-3 py-1 rounded-lg border border-neutral-800 shadow-inner tracking-wider">
              {vehicle.licensePlate}
            </span>
          </div>
          
          <h4 className="text-xl text-white font-black uppercase leading-tight flex items-center gap-1.5">
            <span className="shrink-0 flex items-center justify-center [&_svg]:w-5 [&_svg]:h-5 [&_div]:w-5 [&_div]:h-5 [&_div]:text-[10px]">
              {getBrandLogo((vehicle.brand || '').split(' ')[0])}
            </span>
            <span className="truncate">{vehicle.brand}</span>
          </h4>
          
          <h5 className="text-xs text-neutral-400 font-bold uppercase truncate mt-0.5">{vehicle.model}</h5>
        </div>
        
        {/* Barra de Progreso */}
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[8px] font-black uppercase tracking-widest text-neutral-500 font-bold">Progreso Reparación</span>
          </div>
          <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden shadow-inner border border-neutral-800/50">
            <div 
              className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full relative transition-all duration-500`}
              style={{ width: getProgressWidth(vehicle.status) }}
            >
              <div className="absolute right-0 top-0 h-full w-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
