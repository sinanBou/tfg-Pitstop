import React from 'react';
import { Card } from '@/components/common/Card/Card';
import { BRAND_LOGOS, getBrandLogo } from '@/assets/BrandLogos';
import { Car, Trash } from '@/assets/icons';
import { useTranslation } from '@/i18n';

/**
 * Propiedades del componente VehicleCard.
 */
interface VehicleCardProps {
  /** Marca y modelo del vehículo (ej. "Audi A4"). */
  brand: string;
  /** Matrícula del vehículo (ej. "1234-BBB"). */
  plate: string;
  /** Estado actual del vehículo (ej: 'EN_CASA', 'IN_PROGRESS', 'COMPLETED', etc.). */
  status?: string;
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
 * e incluye el panel de matrícula estilo europeo, badge de estado en tiempo real y botón de eliminación.
 */
export const VehicleCard: React.FC<VehicleCardProps> = ({ 
  brand, plate, status, variant = 'blue', onClick, onDelete, index = 0 
}) => {
  const { t } = useTranslation();
  const brandKey = brand.split(' ')[0].toUpperCase().trim();
  const cleanBrand = brandKey === 'MERCEDES' ? 'MERCEDES-BENZ' : brandKey;
  const hasLogo = cleanBrand in BRAND_LOGOS;

  return (
    <Card 
      variant={variant} 
      padding="none" 
      rounded="2xl"
      onClick={onClick}
      className={`p-6 sm:p-7 hover:border-blue-500/40 relative group overflow-hidden animate-in fade-in slide-in-from-bottom-${index % 5 + 1} duration-500 delay-${(index % 3) * 100} flex flex-col justify-between shadow-sm hover:shadow-xl transition-all`}
    >
       {/* Logotipo translúcido gigante de fondo */}
       <div className="absolute -bottom-6 -right-6 text-slate-900 dark:text-white opacity-[0.03] dark:opacity-[0.03] group-hover:opacity-[0.08] dark:group-hover:opacity-[0.10] transition-all duration-700 pointer-events-none transform group-hover:scale-110">
          {hasLogo ? (
             <div className="w-44 h-44 flex items-center justify-center [&_svg]:w-full [&_svg]:h-full [&_svg]:fill-current">
                {BRAND_LOGOS[cleanBrand]}
             </div>
          ) : (
             <Car className="w-44 h-44" strokeWidth={0.75} />
          )}
       </div>

       <div className="relative z-10 flex flex-col gap-5">
          <div className="flex justify-between items-start gap-4">
             {/* Icono de Marca */}
             <div className="w-14 h-14 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all [&_svg]:w-8 [&_svg]:h-8 [&_div]:w-8 [&_div]:h-8 [&_div]:text-base shrink-0">
                {getBrandLogo(brand.split(' ')[0])}
             </div>

             {/* Matrícula Europea y Botón Borrar */}
             <div className="flex items-center gap-3">
                <div className="inline-flex items-center rounded-lg border border-slate-300 dark:border-neutral-700 overflow-hidden shadow-sm bg-white dark:bg-neutral-900">
                   <div className="bg-blue-700 px-1.5 py-1.5 flex flex-col items-center justify-center text-white text-[8px] font-black leading-none shrink-0">
                      <span>★</span>
                      <span className="font-bold text-[7px] mt-0.5">E</span>
                   </div>
                   <div className="px-2.5 py-1 text-slate-900 dark:text-white font-mono font-black text-sm tracking-wider">
                      {plate}
                   </div>
                </div>

                {onDelete && (
                   <button
                      onClick={(e) => {
                         e.stopPropagation();
                         onDelete();
                      }}
                      className="w-8 h-8 bg-red-500/10 border border-red-500/25 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all flex items-center justify-center active:scale-95 shadow-sm cursor-pointer shrink-0"
                      title={t('common.delete')}
                   >
                      <Trash className="w-4 h-4" />
                   </button>
                )}
             </div>
          </div>

          <div>
             <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-900 dark:text-white tracking-wider group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {brand}
             </h3>

             {/* Indicador de Estado en tiempo real del vehículo */}
             {status && (
                <div className="flex items-center gap-1.5 mt-2">
                   <span className="relative flex h-2 w-2">
                      {status !== 'EN_CASA' && (
                         <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                            status === 'COMPLETED' ? 'bg-green-500' : status === 'DELAYED' ? 'bg-red-500' : 'bg-blue-500'
                         } opacity-75`} />
                      )}
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${
                         status === 'COMPLETED' ? 'bg-green-600' : status === 'DELAYED' ? 'bg-red-600' : status === 'EN_CASA' ? 'bg-slate-400' : 'bg-blue-600'
                      }`} />
                   </span>
                   <span className={`text-[10px] font-black uppercase tracking-wider ${
                      status === 'COMPLETED' ? 'text-green-700 dark:text-green-400' : status === 'DELAYED' ? 'text-red-700 dark:text-red-400' : status === 'EN_CASA' ? 'text-slate-500 dark:text-neutral-400' : 'text-blue-700 dark:text-blue-400'
                   }`}>
                      {status === 'COMPLETED' ? 'Listo para Recoger' : status === 'EN_CASA' ? 'En Garaje / Disponible' : 'En Taller / En Servicio'}
                   </span>
                </div>
             )}
          </div>
       </div>
    </Card>
  );
};

