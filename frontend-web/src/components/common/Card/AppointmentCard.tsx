import React from 'react';
import { Card } from '@/components/common/Card/Card';
import { getBrandLogo } from '@/assets/BrandLogos';
import { Calendar, Lock, Check } from '@/assets/icons';

/**
 * Propiedades del componente AppointmentCard.
 */
interface AppointmentCardProps {
  /** Tipo de servicio o cita (ej. "Revisión", "Cambio Filtro"). */
  type: string;
  /** Fecha y hora de programación de la cita. */
  dateTime: string;
  /** Comentarios descriptivos o nota del cliente (opcional). */
  description?: string;
  /** Estado de progreso o confirmación (ej. "PENDING", "CONFIRMED") (opcional). */
  status?: string;
  /** Tema cromático del borde y acento del botón. Por defecto 'red'. */
  variant?: 'red' | 'blue';
  /** Información del vehículo (ej. "Audi A3 Blanco") (opcional). */
  vehicleDisplay?: string;
  /** Nombre completo del cliente (opcional). */
  clientName?: string;
  /** Callback opcional que se ejecuta al presionar la tarjeta. */
  onClick?: () => void;
  /** Compacta los textos y reduce el padding para cuadrículas ajustadas. Por defecto false. */
  isCompact?: boolean;
  /** Listado de tareas solicitadas separadas por comas (opcional). */
  serviceType?: string;
  /** Listado de tareas ya completadas separadas por comas (opcional). */
  completedTasks?: string;
  /** Duración estimada del servicio en minutos (opcional). */
  estimatedDuration?: number;
  /** Estado de recepción del vehículo en el taller físico (opcional). */
  vehicleReceived?: boolean;
}

/**
 * Tarjeta interactiva para la representación de Citas.
 * Soporta renderización normal (historiales) y compacta (planning/timelines),
 * además de mostrar logotipos de marcas de automoción, contadores de subtareas y etiquetas de recepción.
 */
export const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  type, dateTime, description, status, variant = 'red', vehicleDisplay, clientName, onClick, isCompact = false,
  serviceType, completedTasks, estimatedDuration, vehicleReceived
}) => {
  const dateObj = new Date(dateTime);
  const durationMinutes = estimatedDuration || 60;
  const endTimeObj = new Date(dateObj.getTime() + durationMinutes * 60000);

  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const startTimeStr = formatTime(dateObj);
  const endTimeStr = formatTime(endTimeObj);

  const getStatusBorder = () => {
    if (status === 'DELAYED') return 'border-l-[4px] border-l-red-500';
    if (status === 'COMPLETED') return 'border-l-[4px] border-l-emerald-500';
    if (status === 'IN_PROGRESS') return 'border-l-[4px] border-l-blue-500';
    if (vehicleReceived === true) return 'border-l-[4px] border-l-emerald-500';
    if (vehicleReceived === false) return 'border-l-[4px] border-l-amber-500';
    return variant === 'blue' ? 'border-l-[4px] border-l-blue-500' : 'border-l-[4px] border-l-red-500';
  };

  const isTask = type.toUpperCase() === 'TAREA';

  return (
    <Card 
      variant={variant} 
      padding="none" 
      onClick={onClick}
      rounded="2xl"
      className={`w-full h-full bg-white dark:bg-neutral-900 border border-slate-200/90 dark:border-neutral-800/80 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-start ${getStatusBorder()} ${isCompact ? 'px-2.5 py-1.5' : 'p-6 justify-center'}`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
        <Calendar className="w-16 h-16" strokeWidth={1} />
      </div>

      <div className={`relative flex-1 ${isCompact ? 'flex flex-col justify-between overflow-hidden' : 'space-y-4'}`}>
        <div>
          {/* Header row: Type, client and time */}
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
              <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0 ${
                isTask
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
              }`}>
                {type}
              </span>
              {clientName && (
                <span className="text-[10px] text-slate-600 dark:text-neutral-400 font-bold uppercase truncate min-w-0" title={clientName}>
                  {clientName}
                </span>
              )}
            </div>

            {isCompact ? (
              <span className="text-slate-900 dark:text-white text-[11px] font-black font-mono tracking-tight shrink-0 bg-slate-100 dark:bg-neutral-800/80 px-1.5 py-0.5 rounded-md border border-slate-200/80 dark:border-white/5">
                {startTimeStr} - {endTimeStr}
              </span>
            ) : (
              status && (
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0 ${variant === 'red' ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'}`}>
                  {status}
                </div>
              )
            )}
          </div>

          {/* Vehicle display */}
          {vehicleDisplay && (
            <div className={`text-slate-900 dark:text-white font-black tracking-tight uppercase leading-snug truncate flex items-center gap-1.5 ${isCompact ? 'text-[13px] my-0.5' : 'text-lg mb-1'}`}>
              <span className={`shrink-0 flex items-center justify-center ${isCompact ? '[&_svg]:w-3.5 [&_svg]:h-3.5 [&_div]:w-3.5 [&_div]:h-3.5 [&_div]:text-[7px]' : '[&_svg]:w-5 [&_svg]:h-5 [&_div]:w-5 [&_div]:h-5 [&_div]:text-[9px]'}`}>
                {getBrandLogo(vehicleDisplay.split(' ')[0])}
              </span>
              <span className="truncate">{vehicleDisplay}</span>
            </div>
          )}

          {/* Task checklist progress */}
          {(() => {
            const totalTasksList = (serviceType || '').split(',').map(c => c.trim()).filter(Boolean);
            const completedTasksList = (completedTasks || '').split(',').map(c => c.trim()).filter(Boolean);
            const hasTasks = totalTasksList.length > 0;
            if (!hasTasks) return null;
            
            return (
              <div className="mt-1 flex items-center gap-1">
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${
                  completedTasksList.length === totalTasksList.length 
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25' 
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25'
                }`}>
                  {completedTasksList.length}/{totalTasksList.length} Tareas
                </span>
              </div>
            );
          })()}

          {!isCompact && (
            <div className="text-slate-900 dark:text-white font-black text-xl tracking-tight uppercase mt-2">
              {startTimeStr}
            </div>
          )}
        </div>

        {/* Compact footer: duration, reception chip, and description snippet */}
        {isCompact && (
          <div className="flex items-center gap-1.5 mt-auto pt-1 flex-wrap overflow-hidden">
            {estimatedDuration && (
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-neutral-300 font-mono shrink-0">
                {estimatedDuration >= 60 ? `${Math.floor(estimatedDuration / 60)}h${estimatedDuration % 60 > 0 ? ` ${estimatedDuration % 60}m` : ''}` : `${estimatedDuration}m`}
              </span>
            )}
            {vehicleReceived === false && (
              <span className="text-[7px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                <Lock className="w-2 h-2" />
                Sin recep.
              </span>
            )}
            {vehicleReceived === true && (
              <span className="text-[7px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                <Check className="w-2 h-2" />
                En taller
              </span>
            )}
            {status === 'DELAYED' && (
              <span className="text-[7px] font-black px-1.5 py-0.5 rounded-md bg-red-500/15 border border-red-500/25 text-red-600 dark:text-red-400 uppercase tracking-wider shrink-0">
                Retrasada
              </span>
            )}
            {description && (
              <span className="text-[8px] text-slate-500 dark:text-neutral-400 italic truncate min-w-0">
                "{description}"
              </span>
            )}
          </div>
        )}

        {!isCompact && (
          <div className="flex flex-col gap-1">
            <div className="text-[10px] font-mono text-slate-500 dark:text-neutral-400 uppercase flex items-center gap-1.5 font-bold">
              <Calendar className="w-3 h-3" />
              {dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })}
            </div>
            {description && <div className="text-xs text-slate-600 dark:text-neutral-400 font-medium line-clamp-1 italic mt-1 opacity-80 group-hover:opacity-100 transition-opacity">"{description}"</div>}
          </div>
        )}
      </div>
    </Card>
  );
};
