import React from 'react';
import { Card } from './Card';

interface VehicleCardProps {
  brand: string;
  plate: string;
  variant?: 'blue' | 'red';
  onClick?: () => void;
  index?: number;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ 
  brand, plate, variant = 'blue', onClick, index = 0 
}) => {
  return (
    <Card 
      variant={variant} 
      padding="none" 
      onClick={onClick}
      className={`p-8 hover:border-blue-500/40 relative group overflow-hidden animate-in fade-in slide-in-from-bottom-${index % 5 + 1} duration-500 delay-${(index % 3) * 100}`}
    >
       <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
          <svg className="w-48 h-48" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
       </div>

       <div className="relative z-10 flex flex-col gap-6">
          <div className="flex justify-between items-start">
             <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-[360deg] duration-700">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10h14l1.5 4H3.5L5 10zM5 14v4h2v-4m10 0v4h2v-4M8 10V8c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2" /></svg>
             </div>
             <div className="flex flex-col items-end">
                <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest leading-none mb-1">Matrícula</p>
                <p className="text-white font-mono font-black text-xl tracking-[0.1em]">{plate}</p>
             </div>
          </div>

          <div>
             <h3 className="text-2xl font-black italic uppercase text-white tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] group-hover:text-blue-400 transition-colors">{brand}</h3>
          </div>
       </div>
    </Card>
  );
};
