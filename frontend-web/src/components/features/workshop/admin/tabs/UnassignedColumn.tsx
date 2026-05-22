import React, { useState } from 'react';
import { AppointmentCard } from '../../../../common/Card/index';

/**
 * Columna "Sin Asignar" — renderiza las citas como una lista vertical
 * scrollable en lugar de posicionarlas en el grid temporal.
 * Evita que muchas citas se subdividan y sean ilegibles.
 */

interface UnassignedAppointment {
  id: string;
  dateTime: string;
  description?: string;
  status?: string;
  vehicleDisplay?: string;
  clientFullName?: string;
  estimatedDuration?: number;
  assignedEmployeeId?: string | null;
  isTask?: boolean;
  serviceType?: string;
  [key: string]: unknown;
}

interface UnassignedColumnProps {
  appointments: UnassignedAppointment[];
  /** Total height del grid temporal (para sincronizar la altura visual) */
  gridHeight: number;
  onManage?: (app: UnassignedAppointment) => void;
  onViewChecklist?: (app: UnassignedAppointment) => void;
  onDeleteTask?: (id: string) => Promise<boolean | void>;
  onDeleteAppointment?: (id: string) => Promise<boolean | void>;
  onUpdateStatus?: (id: string, status: string, isTask?: boolean) => Promise<boolean | void>;
  readOnly?: boolean;
  columnWidth?: string;
}

/** Formatea duración en minutos a texto legible */
const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const UnassignedColumn: React.FC<UnassignedColumnProps> = ({
  appointments,
  gridHeight,
  onManage,
  onViewChecklist,
  onDeleteTask,
  onDeleteAppointment,
  onUpdateStatus,
  readOnly = false,
  columnWidth,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Ordenar por hora
  const sorted = [...appointments].sort(
    (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
  );

  /** Handlers de Drag & Drop */
  const handleDragStart = (e: React.DragEvent, app: UnassignedAppointment) => {
    if (readOnly) { e.preventDefault(); return; }
    e.dataTransfer.setData('text/plain', app.id);
    setDraggedId(app.id);
    setTimeout(() => {
      if (e.target instanceof HTMLElement) e.target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) e.target.style.opacity = '1';
    setDraggedId(null);
  };

  /** Handler de eliminar */
  const handleDelete = async (e: React.MouseEvent, app: UnassignedAppointment) => {
    e.stopPropagation();
    if (readOnly) return;

    if (app.isTask && onDeleteTask) {
      if (window.confirm('¿Eliminar esta tarea de forma permanente?')) {
        await onDeleteTask(app.id);
      }
    } else if (onDeleteAppointment) {
      if (window.confirm('¿Eliminar esta cita de forma permanente?\n\nSe borrará también del panel del cliente.')) {
        await onDeleteAppointment(app.id);
      }
    }
  };

  return (
    <div
      style={{ width: columnWidth, height: gridHeight }}
      className="shrink-0 border-r border-neutral-800/60 relative flex flex-col"
    >
      {/* Zona de scroll con las tarjetas */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12 opacity-50">
            <svg className="w-10 h-10 text-neutral-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-neutral-600 text-[10px] font-black uppercase tracking-widest">
              Sin citas pendientes
            </p>
          </div>
        ) : (
          sorted.map((app) => {
            const dateObj = new Date(app.dateTime);
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            const isDragging = draggedId === app.id;

            return (
              <div
                key={app.id}
                draggable={!readOnly}
                onDragStart={(e) => handleDragStart(e, app)}
                onDragEnd={handleDragEnd}
                className={`
                  group/card relative rounded-2xl overflow-hidden
                  transition-all duration-200
                  ${readOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
                  ${isDragging ? 'scale-95 opacity-40' : 'hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10'}
                  border border-transparent hover:border-blue-500/20
                `}
              >
                {/* Contenido de la tarjeta */}
                <div className="bg-neutral-900/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-neutral-800/40">
                  {/* Header compacto con hora y tipo */}
                  <div className="flex items-center justify-between px-3 py-2 bg-blue-500/5 border-b border-blue-500/10">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${app.isTask ? 'bg-emerald-400' : 'bg-blue-400'} animate-pulse`} />
                      <span className={`text-[9px] font-black uppercase tracking-widest ${app.isTask ? 'text-emerald-400' : 'text-blue-400'}`}>
                        {app.isTask ? 'Tarea' : 'Cita'}
                      </span>
                    </div>
                    <span className="text-white text-[11px] font-black font-mono">
                      {timeStr}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="px-3 py-2.5 space-y-1">
                    {/* Vehículo */}
                    {app.vehicleDisplay && (
                      <div className="text-white font-black text-[13px] uppercase tracking-tight leading-tight truncate">
                        {app.vehicleDisplay}
                      </div>
                    )}

                    {/* Cliente + Duración */}
                    <div className="flex items-center justify-between gap-2">
                      {app.clientFullName && (
                        <span className="text-neutral-400 text-[10px] font-bold truncate">
                          {app.clientFullName}
                        </span>
                      )}
                      {app.estimatedDuration && (
                        <span className="text-neutral-500 text-[9px] font-mono font-bold shrink-0 bg-neutral-800/60 px-1.5 py-0.5 rounded-md">
                          {formatDuration(app.estimatedDuration)}
                        </span>
                      )}
                    </div>

                    {/* Descripción (truncada) */}
                    {app.description && (
                      <p className="text-neutral-500 text-[10px] italic line-clamp-1 mt-0.5">
                        "{app.description}"
                      </p>
                    )}
                  </div>

                  {/* Barra de acciones — solo en hover */}
                  <div className="flex items-center gap-1 px-2 py-1.5 bg-black/40 border-t border-neutral-800/40 opacity-0 group-hover/card:opacity-100 transition-all duration-200">
                    {/* Gestionar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onManage ? onManage(app) : alert(`Gestionar: ${app.vehicleDisplay}`);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
                      title="Gestionar"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Gestionar
                    </button>

                    {/* Checklist (solo tareas) */}
                    {app.isTask && app.serviceType && onViewChecklist && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onViewChecklist(app); }}
                        className="flex items-center justify-center w-7 h-7 rounded-lg text-blue-400 hover:text-white hover:bg-blue-500/20 transition-all"
                        title="Ver checklist"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </button>
                    )}

                    {/* Eliminar */}
                    {!readOnly && onUpdateStatus && (
                      <button
                        onClick={(e) => handleDelete(e, app)}
                        className="flex items-center justify-center w-7 h-7 rounded-lg text-red-400 hover:text-white hover:bg-red-500/20 transition-all"
                        title="Eliminar"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>


              </div>
            );
          })
        )}
      </div>

      {/* Badge de conteo */}
      {sorted.length > 0 && (
        <div className="sticky bottom-0 flex items-center justify-center py-2 bg-gradient-to-t from-neutral-900/95 via-neutral-900/80 to-transparent pointer-events-none">
          <span className="px-3 py-1 bg-blue-500/15 border border-blue-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-blue-400">
            {sorted.length} {sorted.length === 1 ? 'cita' : 'citas'}
          </span>
        </div>
      )}
    </div>
  );
};
