import React, { useState, useRef } from 'react';
import { AppointmentCard } from '@/components/common/Card/AppointmentCard';
import { useToast } from '@/hooks/useToast';
import { ConfirmCardModal } from '@/components/common/ConfirmCardModal';
import { Edit, Lock, FileText, Clock, X } from '@/assets/icons';

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
  const toast = useToast();
  const isVehicleReceived = appointment.vehicleReceived === true;
  const [isResizing, setIsResizing] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'cancel' | 'delay' | null;
    title: string;
    description: string;
    confirmText?: string;
    theme?: 'red' | 'blue' | 'green' | 'amber';
  } | null>(null);

  const handleConfirmAction = async () => {
    if (!confirmModal) return;
    const { type } = confirmModal;
    setConfirmModal(null);

    if (type === 'cancel') {
      if (appointment.isTask && onDeleteTask) {
        await onDeleteTask(appointment.id);
      } else if (onUpdateStatus) {
        await onUpdateStatus(appointment.id, 'CANCELLED', appointment.isTask);
      } else if (onDeleteAppointment) {
        await onDeleteAppointment(appointment.id);
      }
    } else if (type === 'delay' && onUpdateStatus) {
      await onUpdateStatus(appointment.id, 'DELAYED', appointment.isTask);
    }
  };
  
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
  const dragGhostRef = useRef<HTMLDivElement | null>(null);

  // Handlers para Mover (Drag & Drop tradicional)
  const handleDragStart = (e: React.DragEvent) => {
    if (isResizing || readOnly) {
      e.preventDefault();
      return;
    }
    
    e.dataTransfer.setData('text/plain', appointment.id);
    e.dataTransfer.effectAllowed = 'move';

    // Crear drag ghost personalizado con info clave
    const ghost = document.createElement('div');
    ghost.style.cssText = `
      position: fixed; top: -1000px; left: -1000px;
      display: flex; align-items: center; gap: 8px;
      padding: 10px 16px; border-radius: 16px;
      background: rgba(0,0,0,0.92); backdrop-filter: blur(12px);
      border: 1px solid ${appointment.isTask ? 'rgba(59,130,246,0.4)' : 'rgba(239,68,68,0.4)'};
      box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 20px ${appointment.isTask ? 'rgba(59,130,246,0.15)' : 'rgba(239,68,68,0.15)'};
      color: white; font-family: system-ui, sans-serif; white-space: nowrap; z-index: 9999;
    `;
    
    const durationStr = appointment.estimatedDuration 
      ? (appointment.estimatedDuration >= 60 
        ? `${Math.floor(appointment.estimatedDuration / 60)}h${appointment.estimatedDuration % 60 > 0 ? `${appointment.estimatedDuration % 60}m` : ''}` 
        : `${appointment.estimatedDuration}m`)
      : '';

    ghost.innerHTML = `
      <span style="width:6px;height:6px;border-radius:50%;background:${appointment.isTask ? '#3b82f6' : '#ef4444'};flex-shrink:0"></span>
      <span style="font-size:12px;font-weight:900;letter-spacing:0.5px;text-transform:uppercase">${appointment.vehicleDisplay || 'Cita'}</span>
      ${durationStr ? `<span style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.5);font-family:monospace;padding:2px 6px;background:rgba(255,255,255,0.06);border-radius:6px;border:1px solid rgba(255,255,255,0.08)">${durationStr}</span>` : ''}
      ${appointment.clientFullName ? `<span style="font-size:10px;color:rgba(255,255,255,0.4);border-left:1px solid rgba(255,255,255,0.1);padding-left:8px">${appointment.clientFullName}</span>` : ''}
    `;

    document.body.appendChild(ghost);
    dragGhostRef.current = ghost;
    e.dataTransfer.setDragImage(ghost, 20, 20);

    setTimeout(() => {
        if (e.target instanceof HTMLElement) {
            e.target.style.opacity = '0.3';
            e.target.style.transform = 'scale(0.97)';
        }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '1';
        e.target.style.transform = '';
    }
    // Limpiar drag ghost
    if (dragGhostRef.current) {
      document.body.removeChild(dragGhostRef.current);
      dragGhostRef.current = null;
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

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;

    if (appointment.isTask && onDeleteTask) {
      setConfirmModal({
        isOpen: true,
        type: 'cancel',
        title: 'Eliminar Tarea',
        description: '¿Estás seguro de que deseas ELIMINAR esta tarea de forma permanente?',
        confirmText: 'Sí, Eliminar',
        theme: 'red'
      });
    } else {
      setConfirmModal({
        isOpen: true,
        type: 'cancel',
        title: 'Cancelar Cita',
        description: '¿Deseas cancelar esta cita? El cliente verá el aviso de cancelación en su panel de notificaciones.',
        confirmText: 'Sí, Cancelar',
        theme: 'red'
      });
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
        className={`absolute hover:z-50 transition-all origin-center ${readOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
        style={{
            top: `${topPosition}px`,
            height: `${duration * minuteHeight}px`,
            left: `${(lane / totalLanes) * 100}%`,
            width: `${(1 / totalLanes) * 100}%`,
            zIndex: isResizing ? 60 : 10
        }}
    >
        <div className="w-full h-full relative p-[2px]">

           {/* Visual Card - actúa como el contenedor del grupo de hover */}
           <div className={`w-full h-full relative ${isResizing ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''} rounded-2xl hover:[&_.actions-bar]:opacity-100 hover:[&_.actions-bar]:pointer-events-auto hover:[&_.resize-handle]:opacity-100`}>

             {/* Botones de acción — flotando centrados encima de la tarjeta */}
             <div className={`actions-bar absolute ${topPosition < 40 ? 'top-2' : '-top-9'} left-1/2 -translate-x-1/2 z-30 flex gap-2 bg-black/95 backdrop-blur-md border border-white/10 rounded-full px-2 py-1 shadow-2xl opacity-0 transition-all duration-200 pointer-events-none whitespace-nowrap`}>

               {/* Gestionar */}
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                   if (!isVehicleReceived) return;
                   onManage ? onManage(appointment) : toast.info(`Gestionar: ${appointment.vehicleDisplay}`);
                 }}
                 disabled={!isVehicleReceived}
                 className={`w-8 h-8 border rounded-full transition-all flex items-center justify-center active:scale-95 ${
                   isVehicleReceived
                     ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white hover:text-black cursor-pointer'
                     : 'bg-amber-950/20 border-amber-500/20 text-amber-500/40 cursor-not-allowed'
                 }`}
                 title={isVehicleReceived ? 'Gestionar Cita' : 'Recepciona el vehículo primero'}
               >
                 {isVehicleReceived ? (
                   <Edit className="w-4 h-4" />
                 ) : (
                   <Lock className="w-4 h-4" />
                 )}
               </button>

               {/* Checklist */}
               {appointment.isTask && appointment.serviceType && (
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     if (!isVehicleReceived) return;
                     onViewChecklist ? onViewChecklist(appointment) : undefined;
                   }}
                   disabled={!isVehicleReceived}
                   className={`w-8 h-8 border rounded-full transition-all flex items-center justify-center active:scale-95 ${
                     isVehicleReceived
                       ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white cursor-pointer'
                       : 'bg-amber-950/20 border-amber-500/20 text-amber-500/40 cursor-not-allowed'
                   }`}
                   title={isVehicleReceived ? 'Ver checklist de tareas' : 'Recepciona el vehículo primero'}
                 >
                   <FileText className="w-4 h-4" />
                 </button>
               )}

               {/* Retrasar */}
               {onUpdateStatus && appointment.status !== 'DELAYED' && appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && (
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     setConfirmModal({
                       isOpen: true,
                       type: 'delay',
                       title: 'Retrasar Cita/Tarea',
                       description: '¿Seguro que deseas marcar esta cita/tarea como retrasada?',
                       confirmText: 'Sí, Marcar',
                       theme: 'amber'
                     });
                   }}
                   className="w-8 h-8 border border-amber-500/30 bg-amber-500/10 text-amber-400 rounded-full transition-all hover:bg-amber-500 hover:text-white flex items-center justify-center active:scale-95 cursor-pointer"
                   title="Marcar como Retrasada"
                 >
                   <Clock className="w-4 h-4" strokeWidth={2.5} />
                 </button>
               )}

               {/* Cancelar / Eliminar */}
               {!readOnly && onUpdateStatus && (
                 <button
                   onClick={handleCancel}
                   className="w-8 h-8 border border-red-500/30 bg-red-500/10 text-red-400 rounded-full transition-all hover:bg-red-500 hover:text-white flex items-center justify-center active:scale-95 cursor-pointer"
                   title="Cancelar Cita"
                 >
                   <X className="w-4 h-4" strokeWidth={2.5} />
                 </button>
               )}
             </div>

             {/* Contenido de la tarjeta */}
             <div className="w-full h-full">
               <AppointmentCard
                 type={appointment.isTask ? "TAREA" : "CITA"}
                 dateTime={appointment.dateTime}
                 description={appointment.description}
                 status={appointment.status}
                 variant={columnId === null ? "blue" : "red"}
                 vehicleDisplay={appointment.vehicleDisplay}
                 clientName={appointment.clientFullName}
                 isCompact={true}
                 serviceType={appointment.serviceType}
                 completedTasks={appointment.completedTasks}
                 estimatedDuration={appointment.estimatedDuration}
                 vehicleReceived={appointment.vehicleReceived}
               />
             </div>

             {/* Resize handle (Bottom) */}
             {!readOnly && (
               <div
                 onPointerDown={handlePointerDown}
                 className="resize-handle absolute bottom-0 left-0 right-0 h-4 flex items-end justify-center cursor-ns-resize opacity-0 transition-opacity z-20 pb-1"
               >
                 <div className="w-12 h-1.5 bg-white/40 hover:bg-white/70 rounded-full transition-colors mix-blend-screen" />
               </div>
             )}
           </div>
        </div>
        {confirmModal && (
           <ConfirmCardModal
             isOpen={confirmModal.isOpen}
             onClose={() => setConfirmModal(null)}
             onConfirm={handleConfirmAction}
             title={confirmModal.title}
             description={confirmModal.description}
             confirmText={confirmModal.confirmText}
             theme={confirmModal.theme}
           />
        )}
    </div>
  );
};
