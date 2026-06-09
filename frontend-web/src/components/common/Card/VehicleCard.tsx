import React from 'react';
import { Card } from '@/components/common/Card/Card';
import { BRAND_LOGOS, getBrandLogo } from '@/assets/BrandLogos';
import { Car, Trash } from '@/assets/icons';

/**
 * Propiedades del componente VehicleCard.
 */
interface VehicleCardProps {
  /** Marca y modelo del vehículo (ej. "Audi A4"). */
  brand: string;
  /** Matrícula del vehículo (ej. "1234-BBB"). */
  plate: string;
  /** Variante cromática del estilo de tarjeta. Por defecto 'blue'. */
  variant?: 'blue' | 'red';
  /** Callback opcional que se ejecuta al pulsar sobre la tarjeta. */
  onClick?: () => void;
  /** Callback opcional para gestionar la acción de eliminación del vehículo. */
  onDelete?: () => void;
  /** Índice para calcular el retardo en la animación de entrada (fade/slide). Por defecto 0. */
  index?: number;
}

/**
 * Tarjeta interactiva de representación visual de Vehículos.
 * Dibuja un gran logotipo de fondo translúcido correspondiente a la marca del coche,
 * e incluye el panel de matrícula y un botón de eliminación.
 */
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
             <Car className="w-44 h-44" strokeWidth={0.75} />
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
                      <Trash className="w-4 h-4" />
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
