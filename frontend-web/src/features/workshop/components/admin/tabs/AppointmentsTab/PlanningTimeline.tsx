import React, { useState } from 'react';
import { AppointmentBlock } from './AppointmentBlock';
import { UnassignedColumn } from './UnassignedColumn';
import { ImagePreviewModal } from '@/components/common/ImagePreviewModal/ImagePreviewModal';
import { useToast } from '@/hooks/useToast';

interface Column {
  id: string;
  title: string;
  employeeId: string | null;
  role?: string;
  isUnassigned?: boolean;
  profilePictureUrl?: string;
}

interface PlanningTimelineProps {
  columns: Column[];
  appointments: any[];
  selectedDate: Date;
  openTime?: string;
  closeTime?: string;
  onRescheduleTask?: (id: string, employeeId: string | null, newDateTime: Date, newDuration?: number, isTask?: boolean) => Promise<void>;
  onUpdateStatus?: (id: string, status: string, isTask?: boolean) => Promise<boolean | void>;
  onDeleteTask?: (id: string) => Promise<boolean | void>;
  onDeleteAppointment?: (id: string) => Promise<boolean | void>;
  columnWidth?: string;
  readOnly?: boolean;
  fillContainer?: boolean;
  onManage?: (app: any) => void;
  onViewChecklist?: (app: any) => void;
}

const ROW_HEIGHT = 80;
const MINUTE_HEIGHT = ROW_HEIGHT / 30;

export const PlanningTimeline: React.FC<PlanningTimelineProps> = ({
  columns,
  appointments,
  selectedDate,
  openTime = '09:00',
  closeTime = '18:00',
  onRescheduleTask,
  onUpdateStatus,
  onDeleteTask,
  onDeleteAppointment,
  columnWidth = '260px',
  readOnly = false,
  fillContainer = false,
  onManage,
  onViewChecklist,
}) => {
  const toast = useToast();
  const [activePreview, setActivePreview] = useState<{ url: string; title: string } | null>(null);

  const filteredAppointments = appointments.filter(app => {
    // Las tareas de taller (isTask === true) que están sin asignar son globales/comunes a todas las fechas.
    if (app.isTask && (app.assignedEmployeeId === null || app.assignedEmployeeId === undefined)) {
      return true;
    }

    const appDate = new Date(app.dateTime);
    return appDate.getFullYear() === selectedDate.getFullYear() &&
           appDate.getMonth() === selectedDate.getMonth() &&
           appDate.getDate() === selectedDate.getDate();
  });

  // ── Separar columna "Sin Asignar" de las columnas de mecánicos ──
  const unassignedCol = columns.find(c => c.employeeId === null) || null;
  const mechanicColumns = columns.filter(c => c.employeeId !== null);
  const unassignedApps = filteredAppointments.filter(a => a.assignedEmployeeId === null || a.assignedEmployeeId === undefined);

  const workStart = parseInt(openTime.split(':')[0], 10) || 9;
  const workEnd = parseInt(closeTime.split(':')[0], 10) || 18;
  const startDisplay = Math.max(0, workStart - 1);
  const endDisplay = Math.min(24, workEnd + 1);

  const slots: { timeStr: string, isHour: boolean }[] = [];
  for (let h = startDisplay; h < endDisplay; h++) {
    slots.push({ timeStr: `${h.toString().padStart(2, '0')}:00`, isHour: true });
    slots.push({ timeStr: `${h.toString().padStart(2, '0')}:30`, isHour: false });
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
  };

  /** Compute target time from the cursor Y offset within the column */
  const computeDropTime = (e: React.DragEvent): Date => {
    const colRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetY = e.clientY - colRect.top;
    const totalMinutes = offsetY / MINUTE_HEIGHT;
    // Snap to 30-minute grid
    const snappedMinutes = Math.round(totalMinutes / 30) * 30;
    const dropHour = startDisplay + Math.floor(snappedMinutes / 60);
    const dropMinute = snappedMinutes % 60;

    const target = new Date(selectedDate);
    target.setHours(dropHour, dropMinute, 0, 0);
    return target;
  };

  const handleDropColumn = async (e: React.DragEvent, employeeId: string | null) => {
    e.preventDefault();
    if (readOnly) return;
    
    const appId = e.dataTransfer.getData('text/plain');
    if (!appId || !onRescheduleTask) return;

    const app = filteredAppointments.find(a => a.id === appId);
    if (!app) return;

    const duration = app.estimatedDuration || 60;
    const originalDate = new Date(app.dateTime);
    let targetDate = employeeId !== null ? computeDropTime(e) : originalDate;

    // Enforce business rules: Appointments (not Tasks) can only change their scheduled hour if they are DELAYED or explicitly unlocked
    const unlockedApps = JSON.parse(localStorage.getItem('unlocked_appointments') || '[]');
    const isUnlocked = app.status === 'DELAYED' || unlockedApps.includes(app.id);

    if (employeeId !== null && !app.isTask && !isUnlocked) {
      const originalHour = originalDate.getHours();
      const originalMinute = originalDate.getMinutes();
      const dropHour = targetDate.getHours();
      const dropMinute = targetDate.getMinutes();

      if (originalHour !== dropHour || originalMinute !== dropMinute) {
        // Snap back to the original hour and minutes of the appointment
        targetDate = new Date(selectedDate);
        targetDate.setHours(originalHour, originalMinute, 0, 0);
      }
    }

    // ── Collision detection (only for assigned columns) ──
    if (employeeId !== null) {
      const dropStart = targetDate.getTime();
      const dropEnd = dropStart + duration * 60000;

      const colItems = filteredAppointments.filter(
        a => a.assignedEmployeeId === employeeId && a.id !== appId
      );

      const collision = colItems.find(existing => {
        const exStart = new Date(existing.dateTime).getTime();
        const exEnd = exStart + (existing.estimatedDuration || 60) * 60000;
        return dropStart < exEnd && dropEnd > exStart;
      });

      if (collision) {
        const colTime = new Date(collision.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        toast.warning(`No se puede colocar aquí: ya existe "${collision.vehicleDisplay || 'una cita'}" a las ${colTime} en esta columna.`);
        return;
      }
    }

    await onRescheduleTask(appId, employeeId, targetDate, duration, app.isTask);
  };

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">

      {/* Botones de Navegación Horizontal — solo en tabla multi-mecánico */}
      {!fillContainer && (
        <div className="flex justify-end gap-2 mb-3">
          <button
            onClick={() => scroll('left')}
            className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-neutral-400 hover:text-white transition-all"
            title="Desplazar izquierda"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-neutral-400 hover:text-white transition-all"
            title="Desplazar derecha"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      )}
      {/* Contenedor con scroll horizontal — deshabilitado para mecánicos */}
      <div ref={scrollRef} className={fillContainer ? 'w-full overflow-hidden' : 'w-full overflow-x-auto custom-scrollbar pb-4'}>
        <div className={fillContainer ? 'flex flex-col w-full' : 'flex flex-col min-w-full w-max border border-neutral-800/60 rounded-2xl overflow-hidden bg-neutral-900/30 backdrop-blur-sm shadow-2xl'}>

          {/* ── Cabecera fija (sticky) con nombres de mecánicos ── */}
          <div className="flex border-b border-neutral-800/60 sticky top-0 z-30 bg-neutral-900/95 backdrop-blur-md rounded-t-2xl">
            {/* Cabecera "Sin Asignar" — solo si existe */}
            {unassignedCol && (
              <div
                id={`column-${unassignedCol.id}`}
                style={!fillContainer ? { width: columnWidth } : undefined}
                className={`${fillContainer ? 'flex-1' : ''} p-4 border-r border-neutral-800/60 flex items-center justify-between bg-neutral-800/20 transition-all duration-500`}
              >
                <h3 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2 truncate">
                  <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {unassignedCol.title}
                </h3>
                {unassignedApps.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-500/15 border border-blue-500/20 rounded-full text-[9px] font-black text-blue-400">
                    {unassignedApps.length}
                  </span>
                )}
              </div>
            )}
            {/* Cabecera eje de horas (solo si hay columnas de mecánicos) */}
            {mechanicColumns.length > 0 && (
              <div className="w-20 shrink-0 p-4 border-r border-neutral-800/60 flex items-center justify-center">
                <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            {mechanicColumns.map(col => (
              <div
                key={col.id}
                id={`column-${col.id}`}
                style={!fillContainer ? { width: columnWidth } : undefined}
                className={`${fillContainer ? 'flex-1' : ''} p-4 border-r border-neutral-800/60 flex items-center justify-between transition-all duration-500 bg-red-900/5`}
              >
                <h3 className="text-white font-black uppercase tracking-widest text-xs flex flex-col sm:flex-row sm:items-center gap-2 truncate">
                  <span className="flex items-center gap-2 truncate">
                    {col.profilePictureUrl ? (
                      <div 
                        className="w-6 h-6 rounded-md overflow-hidden border border-white/10 shrink-0 cursor-zoom-in hover:scale-105 active:scale-95 transition-all duration-300"
                        onClick={() => setActivePreview({ url: col.profilePictureUrl!, title: col.title })}
                      >
                        <img src={col.profilePictureUrl} alt={col.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    )}
                    {col.title}
                  </span>
                  {col.role && (
                    <span className="px-2 py-0.5 border border-white/20 text-neutral-400 rounded-md text-[9px] font-black tracking-widest uppercase shrink-0">
                      {col.role}
                    </span>
                  )}
                </h3>
              </div>
            ))}
          </div>

          {/* ── Grid con scroll vertical (las horas bajan) ── */}
          <div className="overflow-y-auto max-h-[65vh] custom-scrollbar">
            <div className="flex relative">

              {/* ── Columna Sin Asignar (lista scrollable) ── */}
              {unassignedCol && (
                <div
                  className="shrink-0 border-r border-neutral-800/60"
                  style={{ width: columnWidth }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropColumn(e, null)}
                >
                  <UnassignedColumn
                    appointments={unassignedApps}
                    gridHeight={slots.length * ROW_HEIGHT}
                    onManage={onManage}
                    onViewChecklist={onViewChecklist}
                    onDeleteTask={onDeleteTask}
                    onDeleteAppointment={onDeleteAppointment}
                    onUpdateStatus={onUpdateStatus}
                    readOnly={readOnly}
                    columnWidth="100%"
                  />
                </div>
              )}

              {/* Eje de Horas — solo si hay columnas de mecánicos */}
              {mechanicColumns.length > 0 && (
                <div className="w-20 shrink-0 border-r border-neutral-800/60 bg-neutral-900/40 relative z-0">
                  {slots.map((slot, idx) => {
                    const isSpecial = slot.timeStr === `${workStart.toString().padStart(2, '0')}:00` ||
                                      slot.timeStr === `${workEnd.toString().padStart(2, '0')}:00`;
                    return (
                      <div key={idx} style={{ height: ROW_HEIGHT }} className={`flex items-start justify-center p-2 border-b border-neutral-800/30 relative ${slot.isHour ? '' : 'opacity-50'}`}>
                        {isSpecial && <div className="absolute top-0 left-0 right-0 border-t-2 border-red-500/60 z-10" />}
                        <span className={`font-mono text-[16px] font-black z-20 tracking-tighter ${isSpecial ? 'text-red-500' : 'text-neutral-400'}`}>{slot.timeStr}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Kanban — solo columnas de mecánicos */}
              {mechanicColumns.length > 0 && (
                <div className="flex flex-1 relative z-10">
                  {/* Líneas de fondo */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col z-0">
                    {slots.map((slot, idx) => {
                      const isSpecial = slot.timeStr === `${workStart.toString().padStart(2, '0')}:00` ||
                                        slot.timeStr === `${workEnd.toString().padStart(2, '0')}:00`;
                      return (
                        <div key={`bg-${idx}`} style={{ height: ROW_HEIGHT }} className={`border-b relative ${slot.isHour ? 'border-neutral-800/60' : 'border-neutral-800/20 border-dashed'} w-full`}>
                          {isSpecial && <div className="absolute top-0 left-0 right-0 border-t-2 border-red-500/40" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Columnas de mecánicos (solo las asignadas) */}
                  {mechanicColumns.map(col => {
                    const colApps = filteredAppointments.filter(a => a.assignedEmployeeId === col.employeeId);
                    return (
                      <div
                        key={col.id}
                        style={!fillContainer ? { width: columnWidth, height: slots.length * ROW_HEIGHT } : { height: slots.length * ROW_HEIGHT }}
                        className={`${fillContainer ? 'flex-1' : 'shrink-0'} border-r border-neutral-800/60 relative z-10`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDropColumn(e, col.employeeId)}
                      >
                        {(() => {
                          const sortedApps = [...colApps].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

                          // ── Group overlapping appointments into clusters ──
                          const groups: any[][] = [];
                          sortedApps.forEach(app => {
                            const appStart = new Date(app.dateTime).getTime();
                            if (groups.length === 0) {
                              groups.push([app]);
                              return;
                            }
                            const lastGroup = groups[groups.length - 1];
                            const groupEnd = Math.max(
                              ...lastGroup.map((a: any) => new Date(a.dateTime).getTime() + (a.estimatedDuration || 60) * 60000)
                            );
                            if (appStart < groupEnd) {
                              lastGroup.push(app);
                            } else {
                              groups.push([app]);
                            }
                          });

                          return groups.flatMap(group => {
                            return group.map((app, index) => (
                              <AppointmentBlock
                                key={app.id}
                                appointment={app}
                                lane={index}
                                totalLanes={group.length}
                                minuteHeight={MINUTE_HEIGHT}
                                startHour={startDisplay}
                                columnId={col.employeeId}
                                onReschedule={onRescheduleTask!}
                                onUpdateStatus={onUpdateStatus}
                                onDeleteTask={onDeleteTask}
                                onDeleteAppointment={onDeleteAppointment}
                                onManage={onManage}
                                onViewChecklist={onViewChecklist}
                                selectedDate={selectedDate}
                                readOnly={readOnly}
                              />
                            ));
                          });
                        })()}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {activePreview && (
        <ImagePreviewModal
          isOpen={!!activePreview}
          onClose={() => setActivePreview(null)}
          imageUrl={activePreview.url}
          title={activePreview.title}
        />
      )}
    </div>
  );
};
