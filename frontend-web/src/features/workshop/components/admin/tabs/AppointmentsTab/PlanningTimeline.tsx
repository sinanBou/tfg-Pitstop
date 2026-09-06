import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AppointmentBlock } from './AppointmentBlock';
import { UnassignedColumn } from './UnassignedColumn';
import { ImagePreviewModal } from '@/components/common/ImagePreviewModal/ImagePreviewModal';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/i18n';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Maximize2, Minimize2 } from '@/assets/icons';

/**
 * Interfaz que define una columna del planning (mecánico o columna "Sin Asignar").
 */
interface Column {
  /** Identificador único de la columna (típicamente el id de empleado o 'unassigned'). */
  id: string;
  /** Título/nombre mostrado en la cabecera. */
  title: string;
  /** ID del empleado asociado, o null si corresponde a citas/tareas sin asignar. */
  employeeId: string | null;
  /** Rol profesional del empleado para mostrar debajo del nombre (opcional). */
  role?: string;
  /** Flag indicador de si es una columna sin asignar (opcional). */
  isUnassigned?: boolean;
  /** URL de la foto de perfil en S3 del empleado (opcional). */
  profilePictureUrl?: string;
}

/**
 * Propiedades del componente PlanningTimeline.
 */
interface PlanningTimelineProps {
  /** Columnas de mecánicos/unassigned a renderizar. */
  columns: Column[];
  /** Colección completa de citas y tareas del día. */
  appointments: any[];
  /** Fecha actualmente seleccionada en el calendario superior. */
  selectedDate: Date;
  /** Hora de inicio de jornada (ej: "09:00"). */
  openTime?: string;
  /** Hora de finalización de jornada (ej: "18:00"). */
  closeTime?: string;
  /** Callback para cambiar de hora/empleado una tarea/cita mediante drag & drop. */
  onRescheduleTask?: (id: string, employeeId: string | null, newDateTime: Date, newDuration?: number, isTask?: boolean) => Promise<void>;
  /** Callback para actualizar el estado de una cita o tarea (ej: de CONFIRMED a IN_PROGRESS). */
  onUpdateStatus?: (id: string, status: string, isTask?: boolean) => Promise<boolean | void>;
  /** Callback para borrar una tarea del taller. */
  onDeleteTask?: (id: string) => Promise<boolean | void>;
  /** Callback para eliminar/cancelar una cita de cliente. */
  onDeleteAppointment?: (id: string) => Promise<boolean | void>;
  /** Ancho de cada columna de mecánico en el timeline (opcional). Por defecto '260px'. */
  columnWidth?: string;
  /** Deshabilita la edición y arrastre (drag & drop) en el planning. */
  readOnly?: boolean;
  /** Ajusta el timeline al 100% del contenedor padre sin scroll horizontal. */
  fillContainer?: boolean;
  /** Callback para abrir el panel de control del vehículo/cita. */
  onManage?: (app: any) => void;
  /** Callback para visualizar la lista de verificación (checklist) de la tarea. */
  onViewChecklist?: (app: any) => void;
}

const ROW_HEIGHT = 80;
const MINUTE_HEIGHT = ROW_HEIGHT / 30;

/**
 * Planning/Línea temporal diaria interactiva para el taller (Gantt/Kanban).
 * Organiza las citas de clientes y tareas asignadas por columnas de mecánicos y horas de trabajo.
 * Soporta arrastrar y soltar (drag & drop) para re-planificación en tiempo real, detección
 * de colisiones de horarios, y agrupamiento de tareas solapadas en carriles internos.
 */
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
  const { t } = useTranslation();
  const toast = useToast();
  const [activePreview, setActivePreview] = useState<{ url: string; title: string } | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const verticalScrollRef = React.useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      setIsFullscreen(false);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Bloquear scroll de la página de fondo al estar en pantalla completa
  React.useEffect(() => {
    if (isFullscreen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isFullscreen]);

  // Escuchar tecla Escape y evento nativo fullscreenchange para salir
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    };
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen]);

  // Actualizar hora actual cada minuto para la línea del timeline
  React.useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

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

  // ── Métricas del día del taller ──
  const totalCount = filteredAppointments.length;
  const unassignedCount = unassignedApps.length;
  const assignedCount = totalCount - unassignedCount;
  const totalMinutes = filteredAppointments.reduce((acc, app) => acc + (app.estimatedDuration || 60), 0);
  const totalHoursStr = `${Math.floor(totalMinutes / 60)}h${totalMinutes % 60 > 0 ? ` ${totalMinutes % 60}m` : ''}`;

  // ── Comprobación de si selectedDate es hoy y cálculo de posición de línea temporal ──
  const isToday = (
    currentTime.getFullYear() === selectedDate.getFullYear() &&
    currentTime.getMonth() === selectedDate.getMonth() &&
    currentTime.getDate() === selectedDate.getDate()
  );

  const openTimeSafe = openTime || '09:00';
  const closeTimeSafe = closeTime || '18:00';

  const startHourParsed = parseInt(openTimeSafe.split(':')[0], 10);
  const workStart = isNaN(startHourParsed) ? 9 : startHourParsed;

  const endHourParsed = parseInt(closeTimeSafe.split(':')[0], 10);
  let workEnd = isNaN(endHourParsed) ? 18 : endHourParsed;
  if (workEnd === 0 && workStart > 0) {
    workEnd = 24;
  }

  // ── Se muestran TODAS las horas del día (00:00 a 24:00) sin filtros restrictivos ──
  const startDisplay = 0;
  const endDisplay = 24;

  // Auto-scroll inicial a la franja de apertura o a la hora actual
  React.useEffect(() => {
    if (verticalScrollRef.current) {
      const targetHour = isToday
        ? Math.max(0, currentTime.getHours() - 1)
        : Math.max(0, workStart - 1);
      verticalScrollRef.current.scrollTop = targetHour * 2 * ROW_HEIGHT;
    }
  }, [selectedDate, isFullscreen]);

  const currentHourDecimal = currentTime.getHours() + currentTime.getMinutes() / 60;
  const showCurrentTimeLine = isToday && currentHourDecimal >= startDisplay && currentHourDecimal <= endDisplay;
  const currentTimeMinutesFromStart = (currentTime.getHours() - startDisplay) * 60 + currentTime.getMinutes();
  const currentTimeTop = currentTimeMinutesFromStart * MINUTE_HEIGHT;
  const currentTimeFormatted = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  const slots: { timeStr: string, isHour: boolean }[] = [];
  for (let h = startDisplay; h < endDisplay; h++) {
    slots.push({ timeStr: `${h.toString().padStart(2, '0')}:00`, isHour: true });
    slots.push({ timeStr: `${h.toString().padStart(2, '0')}:30`, isHour: false });
  }

  const handleDragOver = (e: React.DragEvent, colId?: string | null) => {
    if (readOnly) return;
    e.preventDefault();
    if (colId !== undefined && dragOverColId !== colId) {
      setDragOverColId(colId);
    }
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
    setDragOverColId(null);
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
        toast.warning(t('appointmentsTab.collisionWarning', { vehicle: collision.vehicleDisplay || t('appointmentsTab.appointmentLabel'), time: colTime }));
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

  const timelineContent = (
    <div className={
      isFullscreen
        ? 'fixed inset-0 z-[9999] bg-slate-100 dark:bg-neutral-950 p-3 sm:p-5 flex flex-col overflow-hidden backdrop-blur-3xl animate-fullscreen-expand'
        : 'w-full'
    }>
      {/* ── Barra de Métricas Operativas Diarias del Taller ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 p-3 bg-white/95 dark:bg-neutral-900/90 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-neutral-800/60 shadow-md">
        
        {/* Identificador de Taller y Fecha Activa al estar en Pantalla Completa */}
        {isFullscreen && (
          <div className="flex items-center gap-2.5 pr-3 border-r border-slate-200 dark:border-neutral-800">
            <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black shadow-md shadow-red-600/20 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <span>{selectedDate.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[8px] font-black">
                  DISPATCH
                </span>
              </div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-neutral-400">
                {mechanicColumns.length} {t('appointmentsTab.mechanic')}{mechanicColumns.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Total Citas */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-white/5">
            <span className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
              {t('appointmentsTab.totalDayAppointments')}:
            </span>
            <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
              {totalCount}
            </span>
          </div>

          {/* Asignadas */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              {t('appointmentsTab.assignedAppointments')}:
            </span>
            <span className="text-xs font-black font-mono text-emerald-700 dark:text-emerald-400">
              {assignedCount}
            </span>
          </div>

          {/* Sin Asignar */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/30">
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              {t('appointmentsTab.unassignedQueue')}:
            </span>
            <span className="text-xs font-black font-mono text-blue-700 dark:text-blue-400">
              {unassignedCount}
            </span>
          </div>

          {/* Horas Estimadas */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-white/5">
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
              {t('appointmentsTab.totalEstimatedHours')}:
            </span>
            <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
              {totalHoursStr}
            </span>
          </div>
        </div>

        {/* Acciones: Pantalla Completa + Navegación Horizontal */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`h-9 px-3.5 flex items-center gap-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 ${
              isFullscreen
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/25'
                : 'bg-slate-100 hover:bg-slate-200 border border-slate-300 dark:bg-white/10 dark:hover:bg-white/15 dark:border-white/10 text-slate-800 dark:text-white'
            }`}
            title={isFullscreen ? t('appointmentsTab.exitFullscreen') : t('appointmentsTab.fullscreen')}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span>{t('appointmentsTab.exitFullscreen')}</span>
                <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-black/20 text-white/80">ESC</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span>{t('appointmentsTab.fullscreen')}</span>
              </>
            )}
          </button>

          {!fillContainer && (
            <div className="flex items-center gap-1 border-l border-slate-200 dark:border-neutral-800 pl-2">
              <button
                onClick={() => scroll('left')}
                className="w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 border border-slate-300 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all cursor-pointer"
                title={t('appointmentsTab.scrollLeftTitle')}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 border border-slate-300 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all cursor-pointer"
                title={t('appointmentsTab.scrollRightTitle')}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contenedor con scroll horizontal */}
      <div
        ref={scrollRef}
        className={
          isFullscreen
            ? 'flex-1 w-full overflow-x-auto custom-scrollbar flex flex-col min-h-0'
            : fillContainer
              ? 'w-full overflow-hidden'
              : 'w-full overflow-x-auto custom-scrollbar pb-4'
        }
      >
        <div className={
          isFullscreen
            ? 'flex flex-col min-w-full w-max flex-1 border border-slate-200 dark:border-neutral-800/60 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900/30 backdrop-blur-sm shadow-sm dark:shadow-2xl min-h-0'
            : fillContainer
              ? 'flex flex-col w-full'
              : 'flex flex-col min-w-full w-max border border-slate-200 dark:border-neutral-800/60 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900/30 backdrop-blur-sm shadow-sm dark:shadow-2xl'
        }>

          {/* ── Cabecera fija (sticky) ── */}
          <div className="flex border-b border-slate-200 dark:border-neutral-800/60 sticky top-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-t-2xl shrink-0">
            {/* Cabecera "Sin Asignar" — solo si existe */}
            {unassignedCol && (
              <div
                id={`column-${unassignedCol.id}`}
                style={!fillContainer ? { width: columnWidth } : undefined}
                className={`${fillContainer ? 'flex-1' : ''} p-3.5 border-r border-slate-200 dark:border-neutral-800/60 flex items-center justify-between bg-blue-50/50 dark:bg-blue-950/20 transition-all`}
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="truncate">
                    <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-wider text-xs truncate">
                      {t('appointmentsTab.unassignedQueue')}
                    </h3>
                    <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                      {unassignedApps.length} {t('appointmentsTab.appointmentLabel').toLowerCase()}{unassignedApps.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                {unassignedApps.length > 0 && (
                  <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md text-[9px] font-black font-mono shadow-sm">
                    {unassignedApps.length}
                  </span>
                )}
              </div>
            )}

            {/* Cabecera eje de horas (solo si hay columnas de mecánicos) */}
            {mechanicColumns.length > 0 && (
              <div className="w-20 shrink-0 p-3.5 border-r border-slate-200 dark:border-neutral-800/60 flex items-center justify-center bg-slate-50/80 dark:bg-neutral-900/60">
                <Clock className="w-4 h-4 text-slate-500 dark:text-neutral-400" />
              </div>
            )}

            {/* Cabeceras de mecánicos */}
            {mechanicColumns.map(col => {
              const colApps = filteredAppointments.filter(a => a.assignedEmployeeId === col.employeeId);
              const colMinutes = colApps.reduce((acc, app) => acc + (app.estimatedDuration || 60), 0);
              const colHours = Math.floor(colMinutes / 60);
              const colMins = colMinutes % 60;
              const durationStr = `${colHours}h${colMins > 0 ? ` ${colMins}m` : ''}`;

              return (
                <div
                  key={col.id}
                  id={`column-${col.id}`}
                  style={!fillContainer ? { width: columnWidth } : undefined}
                  className={`${fillContainer ? 'flex-1' : ''} p-3 border-r border-slate-200 dark:border-neutral-800/60 flex items-center justify-between transition-all duration-300 bg-slate-50/40 dark:bg-neutral-800/20`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {col.profilePictureUrl ? (
                      <div 
                        className="w-7 h-7 rounded-lg overflow-hidden border border-slate-300 dark:border-white/10 shrink-0 cursor-zoom-in hover:scale-105 active:scale-95 transition-all"
                        onClick={() => setActivePreview({ url: col.profilePictureUrl!, title: col.title })}
                      >
                        <img src={col.profilePictureUrl} alt={col.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-red-500" />
                      </div>
                    )}
                    <div className="truncate">
                      <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-tight text-xs truncate">
                        {col.title}
                      </h3>
                      {col.role && (
                        <span className="text-[9px] font-bold tracking-wider text-slate-500 dark:text-neutral-400 uppercase">
                          {col.role}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Workload badge */}
                  <span className="px-2 py-0.5 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 rounded-md text-[9px] font-black font-mono tracking-tight shrink-0 shadow-sm" title={t('appointmentsTab.workloadLabel')}>
                    {colApps.length} · {durationStr}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── Grid con scroll vertical ── */}
          <div
            ref={verticalScrollRef}
            className={`custom-scrollbar ${
              isFullscreen ? 'flex-1 min-h-0 overflow-y-auto' : 'overflow-y-auto max-h-[65vh]'
            }`}
          >
            <div className="flex relative">

              {/* ── Columna Sin Asignar (dock vertical) ── */}
              {unassignedCol && (
                <div
                  className={`shrink-0 border-r border-slate-200 dark:border-neutral-800/60 transition-all ${
                    dragOverColId === unassignedCol.id ? 'ring-2 ring-inset ring-blue-500 bg-blue-500/5' : ''
                  }`}
                  style={{ width: columnWidth }}
                  onDragOver={(e) => handleDragOver(e, unassignedCol.id)}
                  onDragLeave={() => setDragOverColId(null)}
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

              {/* ── Contenedor relativo para el eje de horas y las columnas de mecánicos ── */}
              <div className="flex flex-1 relative">

                {/* ── Línea de Hora Actual (si la fecha es hoy) ── */}
                {showCurrentTimeLine && (
                  <div
                    style={{ top: `${currentTimeTop}px` }}
                    className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                  >
                    <div className="w-20 shrink-0 flex items-center justify-center">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-red-600 text-white shadow-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" />
                        {currentTimeFormatted}
                      </span>
                    </div>
                    <div className="flex-1 h-[2px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] relative">
                      <div className="absolute -left-1 -top-[3px] w-2 h-2 rounded-full bg-red-600 shadow-sm" />
                    </div>
                  </div>
                )}

                {/* Eje de Horas */}
                {mechanicColumns.length > 0 && (
                  <div className="w-20 shrink-0 border-r border-slate-200 dark:border-neutral-800/60 bg-slate-50/80 dark:bg-neutral-900/60 relative z-0">
                    {slots.map((slot, idx) => {
                      const hourNum = parseInt(slot.timeStr.split(':')[0], 10);
                      const isWorkingHour = hourNum >= workStart && hourNum < workEnd;
                      const isSpecial = slot.timeStr === `${workStart.toString().padStart(2, '0')}:00` ||
                                        slot.timeStr === `${workEnd.toString().padStart(2, '0')}:00`;
                      return (
                        <div
                          key={idx}
                          style={{ height: ROW_HEIGHT }}
                          className={`flex items-start justify-center p-2 border-b relative ${
                            isWorkingHour ? '' : 'bg-slate-100/40 dark:bg-neutral-950/40'
                          } ${
                            slot.isHour
                              ? 'border-slate-200 dark:border-neutral-800/60'
                              : 'border-slate-200/60 dark:border-neutral-800/30'
                          }`}
                        >
                          {isSpecial && <div className="absolute top-0 left-0 right-0 border-t-2 border-red-500/60 z-10" />}
                          <span className={`font-mono text-xs font-black z-20 tracking-tight ${
                            isSpecial
                              ? 'text-red-500'
                              : slot.isHour
                                ? 'text-slate-800 dark:text-neutral-200'
                                : 'text-slate-400 dark:text-neutral-500 text-[11px]'
                          }`}>
                            {slot.timeStr}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Kanban — columnas de mecánicos */}
                {mechanicColumns.length > 0 && (
                  <div className="flex flex-1 relative z-10">
                    {/* Líneas de fondo */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col z-0">
                      {slots.map((slot, idx) => {
                        const hourNum = parseInt(slot.timeStr.split(':')[0], 10);
                        const isWorkingHour = hourNum >= workStart && hourNum < workEnd;
                        const isSpecial = slot.timeStr === `${workStart.toString().padStart(2, '0')}:00` ||
                                          slot.timeStr === `${workEnd.toString().padStart(2, '0')}:00`;
                        return (
                          <div
                            key={`bg-${idx}`}
                            style={{ height: ROW_HEIGHT }}
                            className={`border-b relative w-full ${
                              isWorkingHour ? 'bg-transparent' : 'bg-slate-50/60 dark:bg-black/20'
                            } ${
                              slot.isHour
                                ? 'border-slate-200 dark:border-neutral-800/60'
                                : 'border-slate-200/60 dark:border-neutral-800/20 border-dashed'
                            }`}
                          >
                            {isSpecial && <div className="absolute top-0 left-0 right-0 border-t-2 border-red-500/40" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Columnas de mecánicos */}
                    {mechanicColumns.map(col => {
                      const colApps = filteredAppointments.filter(a => a.assignedEmployeeId === col.employeeId);
                      const isTarget = dragOverColId === col.id;

                      return (
                        <div
                          key={col.id}
                          style={!fillContainer ? { width: columnWidth, height: slots.length * ROW_HEIGHT } : { height: slots.length * ROW_HEIGHT }}
                          className={`${fillContainer ? 'flex-1' : 'shrink-0'} border-r border-slate-200 dark:border-neutral-800/60 relative z-10 transition-colors ${
                            isTarget ? 'ring-2 ring-inset ring-blue-500/60 bg-blue-500/[0.04]' : ''
                          }`}
                          onDragOver={(e) => handleDragOver(e, col.id)}
                          onDragLeave={() => setDragOverColId(null)}
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

  return isFullscreen ? createPortal(timelineContent, document.body) : timelineContent;
};

