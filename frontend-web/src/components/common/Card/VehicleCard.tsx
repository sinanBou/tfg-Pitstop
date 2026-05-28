import React from 'react';
import { Card } from '@/components/common/Card/Card';
import { BRAND_LOGOS, getBrandLogo } from '@/components/common/SearchableSelect/BrandLogos';

interface VehicleCardProps {
  brand: string;
  plate: string;
  variant?: 'blue' | 'red';
  onClick?: () => void;
  onDelete?: () => void;
  index?: number;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ 
  brand, plate, variant = 'blue', onClick, onDelete, index = 0 
}) => {
  const brandKey = brand.split(' ')[0].toUpperCase().trim();
  const cleanBrand = brandKey === 'MERCEDES' ? 'MERCEDES-BENZ' : brandKey;
  const hasLogo = cleanBrand in BRAND_LOGOS;

  return (
    <Card 
      variant={variant} 
      padding="none" 
      rounded="2xl"
      onClick={onClick}
      className={`p-8 hover:border-blue-500/40 relative group overflow-hidden animate-in fade-in slide-in-from-bottom-${index % 5 + 1} duration-500 delay-${(index % 3) * 100}`}
    >
       <div className="absolute -bottom-6 -right-6 text-white opacity-[0.03] group-hover:opacity-[0.10] transition-all duration-700 pointer-events-none transform group-hover:scale-110">
          {hasLogo ? (
             <div className="w-44 h-44 flex items-center justify-center [&_svg]:w-full [&_svg]:h-full [&_svg]:fill-current">
                {BRAND_LOGOS[cleanBrand]}
             </div>
          ) : (
             <svg className="w-44 h-44" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                <circle cx="7" cy="17" r="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17h6" />
                <circle cx="17" cy="17" r="2" />
             </svg>
          )}
       </div>

       <div className="relative z-10 flex flex-col gap-6">
          <div className="flex justify-between items-start">
             <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all [&_svg]:w-8 [&_svg]:h-8 [&_div]:w-8 [&_div]:h-8 [&_div]:text-base">
                {getBrandLogo(brand.split(' ')[0])}
             </div>
             <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                   <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest leading-none mb-1">Matrícula</p>
                   <p className="text-white font-mono font-black text-xl tracking-[0.1em]">{plate}</p>
                </div>
                {onDelete && (
                   <button
                      onClick={(e) => {
                         e.stopPropagation();
                         onDelete();
                      }}
                      className="w-8 h-8 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center active:scale-95 shadow-lg shadow-red-500/5 cursor-pointer ml-2 relative z-20"
                      title="Eliminar Vehículo"
                   >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                   </button>
                )}
             </div>
          </div>

          <div>
             <h3 className="text-2xl font-black uppercase text-white tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] group-hover:text-blue-400 transition-colors">{brand}</h3>
          </div>
       </div>
    </Card>
  );
};
