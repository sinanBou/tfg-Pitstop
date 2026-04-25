import React, { useState, useRef } from 'react';
import { AppointmentCard } from '../../../../common/Card/index';

interface AppointmentBlockProps {
  appointment: any;
  minuteHeight: number;
  startHour: number;
  columnId: string | null;
  onReschedule: (appId: string, employeeId: string | null, newDateTime: Date, newDuration: number) => Promise<void>;
  onUpdateStatus?: (id: string, status: string) => Promise<boolean | void>;
  selectedDate: Date;
  readOnly?: boolean;
}

export const AppointmentBlock: React.FC<AppointmentBlockProps> = ({
  appointment,
  minuteHeight,
  startHour,
  columnId,
  onReschedule,
  onUpdateStatus,
  readOnly = false
}) => {
  const [isResizing, setIsResizing] = useState(false);
  
  // La duración real la sacamos del backend. Si no hay, asignamos 60 mins.
  const initialDuration = appointment.estimatedDuration || 60;
  const [duration, setDuration] = useState(initialDuration);

  // Calcular la posición Y (Top)
  const appDate = new Date(appointment.dateTime);
  const minutesFromStart = (appDate.getHours() - startHour) * 60 + appDate.getMinutes();
  const topPosition = minutesFromStart * minuteHeight;
  
  // Ref para calcular deltas de resize
  const resizeStartY = useRef(0);
  const resizeStartDuration = useRef(duration);

  // Handlers para Mover (Drag & Drop tradicional)
  const handleDragStart = (e: React.DragEvent) => {
    if (isResizing || readOnly) {
      e.preventDefault();
      return;
    }
    
    e.dataTransfer.setData('text/plain', appointment.id);

    setTimeout(() => {
        if (e.target instanceof HTMLElement) {
            e.target.style.opacity = '0.5';
        }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '1';
    }
  };

  // Handlers para Resize (Pointer Events en el borde inferior)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (readOnly) return;
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    resizeStartY.current = e.clientY;
    resizeStartDuration.current = duration;
    
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = (e: PointerEvent) => {
    const deltaY = e.clientY - resizeStartY.current;
    const deltaMinutes = deltaY / minuteHeight;
    // Hacemos "snap" cada 30 minutos al vuelo, o libre. Lo haremos con snap de 30 min.
    const rawNewDuration = resizeStartDuration.current + deltaMinutes;
    // Snap
    const snapped = Math.max(30, Math.round(rawNewDuration / 30) * 30);
    setDuration(snapped);
  };

  const handlePointerUp = async (e: PointerEvent) => {
    setIsResizing(false);
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
    
    // Calcular el tiempo que ha quedado al soltar.
    const deltaY = e.clientY - resizeStartY.current;
    const deltaMinutes = deltaY / minuteHeight;
    const rawNewDuration = resizeStartDuration.current + deltaMinutes;
    const finalSnapped = Math.max(30, Math.round(rawNewDuration / 30) * 30);
    
    setDuration(finalSnapped);

    // Enviar API solo si ha cambiado
    if (finalSnapped !== resizeStartDuration.current) {
        await onReschedule(appointment.id, columnId, appDate, finalSnapped);
    }
  };

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly || !onUpdateStatus) return;
    if (window.confirm("¿Estás seguro de que deseas CANCELAR esta cita? Esta acción no se puede deshacer.")) {
        await onUpdateStatus(appointment.id, 'CANCELLED');
    }
  };

  // Limpiar eventos si se desmonta mid-resize
  React.useEffect(() => {
     return () => {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
     };
  }, []);

  return (
    <div 
        draggable={!isResizing && !readOnly}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`absolute left-1 right-1 hover:z-50 transition-transform origin-center group ${readOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
        style={{
            top: `${topPosition}px`,
            height: `${duration * minuteHeight}px`,
            zIndex: isResizing ? 60 : 10
        }}
    >
        <div className="w-full h-full relative p-[2px]">
           {/* Barra de acciones inferior — centrada */}
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2">
             {/* Gestionar — sin funcionalidad aún */}
             <button
               className="w-8 h-8 bg-black/80 backdrop-blur-sm border border-white/15 text-white/70 rounded-full transition-all hover:bg-white hover:text-black shadow-xl flex items-center justify-center"
               title="Gestionar Cita"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
               </svg>
             </button>

             {/* Eliminar */}
             {!readOnly && onUpdateStatus && (
               <button
                 onClick={handleCancel}
                 className="w-8 h-8 bg-black/80 backdrop-blur-sm border border-red-500/30 text-red-400 rounded-full transition-all hover:bg-red-500 hover:text-white shadow-xl flex items-center justify-center"
                 title="Cancelar Cita"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                 </svg>
               </button>
             )}
           </div>


           {/* Visual Card */}
           <div className={`w-full h-full overflow-hidden ${isResizing ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''} rounded-[1.25rem]`}>
               <AppointmentCard 
                   type="CITA" 
                   dateTime={appointment.dateTime} 
                   description={appointment.description} 
                   status={appointment.status} 
                   variant={columnId === null ? "blue" : "red"} 
                   vehicleDisplay={appointment.vehicleDisplay}
                   clientName={appointment.clientFullName}
                   isCompact={true}
               />
           </div>

           {/* Resize handle (Bottom) - Only if not readOnly */}
           {!readOnly && (
            <div 
                onPointerDown={handlePointerDown}
                className="absolute bottom-0 left-0 right-0 h-4 flex items-end justify-center cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity z-20 pb-1"
            >
                <div className="w-12 h-1.5 bg-white/40 hover:bg-white/70 rounded-full transition-colors mix-blend-screen" />
            </div>
           )}
        </div>
    </div>
  );
};
