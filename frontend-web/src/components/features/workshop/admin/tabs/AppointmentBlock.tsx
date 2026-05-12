import React, { useState, useRef } from 'react';
import { AppointmentCard } from '../../../../common/Card/index';

interface AppointmentBlockProps {
  appointment: any;
  minuteHeight: number;
  startHour: number;
  columnId: string | null;
  onReschedule: (appId: string, employeeId: string | null, newDateTime: Date, newDuration: number, isTask?: boolean) => Promise<void>;
  onUpdateStatus?: (id: string, status: string, isTask?: boolean) => Promise<boolean | void>;
  onDeleteTask?: (id: string) => Promise<boolean | void>;
  onDeleteAppointment?: (id: string) => Promise<boolean | void>;
  onManage?: (app: any) => void;
  onViewChecklist?: (app: any) => void;
  selectedDate: Date;
  lane?: number;
  totalLanes?: number;
  readOnly?: boolean;
}

export const AppointmentBlock: React.FC<AppointmentBlockProps> = ({
  appointment,
  minuteHeight,
  startHour,
  columnId,
  onReschedule,
  onUpdateStatus,
  onDeleteTask,
  onDeleteAppointment,
  onManage,
  onViewChecklist,
  lane = 0,
  totalLanes = 1,
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
        await onReschedule(appointment.id, columnId, appDate, finalSnapped, appointment.isTask);
    }
  };

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;

    if (appointment.isTask && onDeleteTask) {
       if (window.confirm("¿Estás seguro de que deseas ELIMINAR esta tarea de forma permanente?")) {
           await onDeleteTask(appointment.id);
       }
    } else {
       // CITA
       const choice = window.confirm("¿Deseas ELIMINAR esta cita de forma permanente? (Se borrará también del panel del cliente).\n\nPulsa 'Aceptar' para ELIMINAR o 'Cancelar' para no hacer nada.");
       if (choice && onDeleteAppointment) {
           await onDeleteAppointment(appointment.id);
       } else if (!choice && onUpdateStatus) {
           // Opcional: Podríamos ofrecer solo cancelar, pero el usuario pidió "eliminar".
           // Dejamos que no haga nada si cancela el confirm.
       }
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
        className={`absolute hover:z-50 transition-all origin-center group ${readOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
        style={{
            top: `${topPosition}px`,
            height: `${duration * minuteHeight}px`,
            left: `${(lane / totalLanes) * 100}%`,
            width: `${(1 / totalLanes) * 100}%`,
            zIndex: isResizing ? 60 : 10
        }}
    >
        <div className="w-full h-full relative p-[2px]">
           {/* Zona invisible que extiende el hover por encima para alcanzar los botones */}
            <div className="absolute -top-12 left-0 right-0 h-12 z-40 pointer-events-none group-hover:pointer-events-auto" />
           {/* Barra de acciones — flota ENCIMA de la tarjeta, solo visible en hover */}
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-50 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
              {/* Gestionar — Abre modal de planificación */}
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onManage ? onManage(appointment) : alert(`Gestionar: ${appointment.vehicleDisplay}`);
                }}
                className="w-7 h-7 bg-black/90 backdrop-blur-sm border border-white/15 text-white/70 rounded-full transition-all hover:bg-white hover:text-black shadow-xl flex items-center justify-center active:scale-95"
                title="Gestionar Cita"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>

              {/* Checklist — Ver sub-tareas del vehículo */}
              {appointment.serviceType && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewChecklist ? onViewChecklist(appointment) : undefined;
                  }}
                  className="w-7 h-7 bg-black/90 backdrop-blur-sm border border-blue-500/30 text-blue-400 rounded-full transition-all hover:bg-blue-500 hover:text-white shadow-xl flex items-center justify-center active:scale-95"
                  title="Ver checklist de tareas"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </button>
              )}

              {/* Confirmar si está PENDING */}
              {appointment.status === 'PENDING' && onUpdateStatus && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStatus(appointment.id, 'CONFIRMED', appointment.isTask);
                  }}
                  className="w-7 h-7 bg-green-500/20 backdrop-blur-sm border border-green-500/30 text-green-400 rounded-full transition-all hover:bg-green-500 hover:text-white shadow-xl flex items-center justify-center active:scale-95"
                  title="Confirmar"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                </button>
              )}

             {/* Eliminar */}
             {!readOnly && onUpdateStatus && (
               <button
                 onClick={handleCancel}
                 className="w-7 h-7 bg-black/90 backdrop-blur-sm border border-red-500/30 text-red-400 rounded-full transition-all hover:bg-red-500 hover:text-white shadow-xl flex items-center justify-center active:scale-95"
                 title="Cancelar Cita"
               >
                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                 </svg>
               </button>
             )}
           </div>


           {/* Visual Card */}
           <div className={`w-full h-full overflow-hidden ${isResizing ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''} rounded-[1.25rem]`}>
               <AppointmentCard 
                   type={appointment.isTask ? "TAREA" : "CITA"} 
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
