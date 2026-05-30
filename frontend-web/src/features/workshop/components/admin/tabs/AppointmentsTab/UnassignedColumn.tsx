import React, { useState } from 'react';
import { getBrandLogo } from '@/assets/BrandLogos';

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
  gridHeight: number;
  onManage?: (app: UnassignedAppointment) => void;
  onViewChecklist?: (app: UnassignedAppointment) => void;
  onDeleteTask?: (id: string) => Promise<boolean | void>;
  onDeleteAppointment?: (id: string) => Promise<boolean | void>;
  onUpdateStatus?: (id: string, status: string, isTask?: boolean) => Promise<boolean | void>;
  readOnly?: boolean;
  columnWidth?: string;
}

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
  const dragGhostRef = React.useRef<HTMLDivElement | null>(null);

  const sorted = [...appointments].sort(
    (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
  );

  const handleDragStart = (e: React.DragEvent, app: UnassignedAppointment) => {
    if (readOnly) { e.preventDefault(); return; }
    e.dataTransfer.setData('text/plain', app.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedId(app.id);

    // Drag ghost personalizado
    const ghost = document.createElement('div');
    ghost.style.cssText = `
      position: fixed; top: -1000px; left: -1000px;
      display: flex; align-items: center; gap: 8px;
      padding: 10px 16px; border-radius: 16px;
      background: rgba(0,0,0,0.92); backdrop-filter: blur(12px);
      border: 1px solid ${app.isTask ? 'rgba(59,130,246,0.4)' : 'rgba(239,68,68,0.4)'};
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
      color: white; font-family: system-ui, sans-serif; white-space: nowrap; z-index: 9999;
    `;
    const dur = app.estimatedDuration
      ? (app.estimatedDuration >= 60
        ? `${Math.floor(app.estimatedDuration / 60)}h${app.estimatedDuration % 60 > 0 ? `${app.estimatedDuration % 60}m` : ''}`
        : `${app.estimatedDuration}m`)
      : '';
    ghost.innerHTML = `
      <span style="width:6px;height:6px;border-radius:50%;background:${app.isTask ? '#3b82f6' : '#ef4444'};flex-shrink:0"></span>
      <span style="font-size:12px;font-weight:900;letter-spacing:0.5px;text-transform:uppercase">${app.vehicleDisplay || 'Cita'}</span>
      ${dur ? `<span style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.5);font-family:monospace;padding:2px 6px;background:rgba(255,255,255,0.06);border-radius:6px;border:1px solid rgba(255,255,255,0.08)">${dur}</span>` : ''}
    `;
    document.body.appendChild(ghost);
    dragGhostRef.current = ghost;
    e.dataTransfer.setDragImage(ghost, 20, 20);

    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.25';
        e.target.style.transform = 'scale(0.96)';
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
      e.target.style.transform = '';
    }
    setDraggedId(null);
    if (dragGhostRef.current) {
      document.body.removeChild(dragGhostRef.current);
      dragGhostRef.current = null;
    }
  };

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
            const day = dateObj.getDate().toString().padStart(2, '0');
            const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            const dateStr = `${day} - ${month}`;
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
                <div className="bg-neutral-900/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-neutral-800/40">
                  <div className="flex items-center justify-between px-3 py-2 bg-blue-500/5 border-b border-blue-500/10">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${app.isTask ? 'bg-emerald-400' : 'bg-blue-400'} animate-pulse`} />
                      <span className={`text-[9px] font-black uppercase tracking-widest ${app.isTask ? 'text-emerald-400' : 'text-blue-400'}`}>
                        {app.isTask ? 'Tarea' : 'Cita'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white text-[11px] font-black font-mono">
                      <span>{dateStr}</span>
                      <span className="text-neutral-700 font-normal">|</span>
                      <span>{timeStr}</span>
                    </div>
                  </div>

                  <div className="px-3 py-2.5 space-y-1">
                    {app.vehicleDisplay && (
                      <div className="text-white font-black text-[13px] uppercase tracking-tight leading-tight truncate flex items-center gap-2">
                        <span className="shrink-0 flex items-center justify-center [&_svg]:w-4 [&_svg]:h-4 [&_div]:w-4 [&_div]:h-4 [&_div]:text-[8px]">
                          {getBrandLogo(app.vehicleDisplay.split(' ')[0])}
                        </span>
                        <span>{app.vehicleDisplay}</span>
                      </div>
                    )}

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

                    {app.description && (
                      <p className="text-neutral-500 text-[10px] italic line-clamp-1 mt-0.5">
                        "{app.description}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 px-2 py-1.5 bg-black/40 border-t border-neutral-800/40 opacity-0 group-hover/card:opacity-100 transition-all duration-200">
                    {(() => {
                      const isReceived = (app as any).vehicleReceived === true;
                      return (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isReceived) return;
                              onManage ? onManage(app) : alert(`Gestionar: ${app.vehicleDisplay}`);
                            }}
                            disabled={!isReceived}
                            className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                              isReceived
                                ? 'text-neutral-400 hover:text-white hover:bg-white/10 cursor-pointer'
                                : 'text-amber-500/50 cursor-not-allowed'
                            }`}
                            title={isReceived ? 'Gestionar' : 'Recepciona el vehículo primero'}
                          >
                            {isReceived ? (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                              </svg>
                            )}
                            {isReceived ? 'Gestionar' : 'Recepción'}
                          </button>

                          {app.isTask && app.serviceType && onViewChecklist && (
                            <button
                              onClick={(e) => { e.stopPropagation(); if (isReceived) onViewChecklist(app); }}
                              disabled={!isReceived}
                              className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                                isReceived
                                  ? 'text-blue-400 hover:text-white hover:bg-blue-500/20 cursor-pointer'
                                  : 'text-amber-500/40 cursor-not-allowed'
                              }`}
                              title={isReceived ? 'Ver checklist' : 'Recepciona el vehículo primero'}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                            </button>
                          )}

                          {!readOnly && onUpdateStatus && (
                            <button
                              onClick={(e) => handleDelete(e, app)}
                              className="flex items-center justify-center w-7 h-7 rounded-lg text-red-400 hover:text-white hover:bg-red-500/20 transition-all cursor-pointer"
                              title="Eliminar"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

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
