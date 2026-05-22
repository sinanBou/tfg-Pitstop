import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppointmentCard } from '../../../common/Card/index';

/* ─────────────────────────────────────────────
 *  STACK & POPOVER PATTERN
 *  -  Collapses multiple overlapping appointments
 *     into a visual "stack" (max 2 visible + "+X más" badge).
 *  -  On hover/click the full list is displayed inside a
 *     floating popover that preserves drag-and-drop capability.
 * ───────────────────────────────────────────── */

/** Appointment shape expected by this component */
interface StackAppointment {
  id: string;
  dateTime: string;
  description?: string;
  status?: string;
  vehicleDisplay?: string;
  clientFullName?: string;
  estimatedDuration?: number;
  assignedEmployeeId?: string | null;
  isTask?: boolean;
  [key: string]: unknown;
}

interface AppointmentStackGroupProps {
  /** All overlapping appointments for this group */
  appointments: StackAppointment[];
  /** Top position (px) — derived from earliest appointment in group */
  topPosition: number;
  /** Height (px) — derived from the longest spanning appointment */
  height: number;
  /** Column employee id (null = unassigned) — used for card variant */
  columnId: string | null;
  /** Minutes-to-pixels multiplier */
  minuteHeight: number;
  /** First visible hour */
  startHour: number;
  /** Read-only mode (mechanic personal view) */
  readOnly?: boolean;
  /** Drag start handler — passes through to blocks */
  onDragStart?: (e: React.DragEvent, appointment: StackAppointment) => void;
  /** Drag end handler */
  onDragEnd?: (e: React.DragEvent) => void;
  /** Callbacks inherited from parent */
  onReschedule: (id: string, employeeId: string | null, dt: Date, dur: number, isTask?: boolean) => Promise<void>;
  onUpdateStatus?: (id: string, status: string, isTask?: boolean) => Promise<boolean | void>;
  onDeleteTask?: (id: string) => Promise<boolean | void>;
  onDeleteAppointment?: (id: string) => Promise<boolean | void>;
  onManage?: (app: StackAppointment) => void;
  selectedDate: Date;
}

/** Max visible cards before collapsing into badge */
const MAX_VISIBLE_CARDS = 2;
/** Visual offset (px) between stacked cards */
const STACK_OFFSET = 5;

export const AppointmentStackGroup: React.FC<AppointmentStackGroupProps> = ({
  appointments,
  topPosition,
  height,
  columnId,
  minuteHeight,
  startHour,
  readOnly = false,
  onReschedule,
  onUpdateStatus,
  onDeleteTask,
  onDeleteAppointment,
  onManage,
  selectedDate,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalCount = appointments.length;
  const hasOverflow = totalCount > MAX_VISIBLE_CARDS;
  const visibleCards = appointments.slice(0, MAX_VISIBLE_CARDS);
  const hiddenCount = totalCount - MAX_VISIBLE_CARDS;
  const variant = columnId === null ? 'blue' : 'red';

  // ── Close popover on outside click / Escape ──
  const closePopover = useCallback(() => setIsPopoverOpen(false), []);

  useEffect(() => {
    if (!isPopoverOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        containerRef.current && !containerRef.current.contains(e.target as Node)
      ) {
        closePopover();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePopover();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isPopoverOpen, closePopover]);

  // ── Hover open/close with delay ──
  const handleMouseEnter = () => {
    if (totalCount <= 1) return;
    hoverTimerRef.current = setTimeout(() => setIsPopoverOpen(true), 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    // Don't close on mouse leave if popover is open (user may move to it)
  };

  const handleStackClick = () => {
    if (totalCount <= 1) return;
    setIsPopoverOpen(prev => !prev);
  };

  // ── Drag handlers for individual cards inside the popover ──
  const handleCardDragStart = (e: React.DragEvent, app: StackAppointment) => {
    if (readOnly) { e.preventDefault(); return; }
    e.dataTransfer.setData('text/plain', app.id);
    setTimeout(() => {
      if (e.target instanceof HTMLElement) e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleCardDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) e.target.style.opacity = '1';
    closePopover();
  };

  // ── Action handlers (confirm, cancel, manage) ──
  const handleConfirm = async (e: React.MouseEvent, app: StackAppointment) => {
    e.stopPropagation();
    if (onUpdateStatus) await onUpdateStatus(app.id, 'CONFIRMED', app.isTask);
  };

  const handleDelete = async (e: React.MouseEvent, app: StackAppointment) => {
    e.stopPropagation();
    if (readOnly) return;

    if (app.isTask && onDeleteTask) {
      if (window.confirm('¿Estás seguro de que deseas ELIMINAR esta tarea de forma permanente?')) {
        await onDeleteTask(app.id);
      }
    } else if (onDeleteAppointment) {
      if (window.confirm('¿Deseas ELIMINAR esta cita de forma permanente? (Se borrará también del panel del cliente).\n\nPulsa \'Aceptar\' para ELIMINAR o \'Cancelar\' para no hacer nada.')) {
        await onDeleteAppointment(app.id);
      }
    }
  };

  const handleManageClick = (e: React.MouseEvent, app: StackAppointment) => {
    e.stopPropagation();
    onManage ? onManage(app) : alert(`Gestionar: ${app.vehicleDisplay}`);
    closePopover();
  };

  /* ━━━ SINGLE APPOINTMENT — render as original AppointmentBlock ━━━ */
  if (totalCount === 1) {
    return null; // Handled individually by PlanningTimeline
  }

  /* ━━━ MULTI APPOINTMENT — Stack + Popover ━━━ */
  return (
    <div
      ref={containerRef}
      className="absolute z-20"
      style={{
        top: `${topPosition}px`,
        height: `${height}px`,
        left: '0',
        width: '100%',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Stack preview ── */}
      <div
        onClick={handleStackClick}
        className="relative w-full cursor-pointer group/stack"
        style={{ height: `${height}px` }}
      >
        {/* Stacked card shadows — visual depth */}
        {visibleCards.map((app, idx) => {
          const dateObj = new Date(app.dateTime);
          const isTop = idx === 0;
          return (
            <div
              key={app.id}
              className={`absolute transition-all duration-300 rounded-[1.25rem] overflow-hidden ${
                isTop
                  ? 'z-10 group-hover/stack:scale-[1.02] group-hover/stack:shadow-2xl'
                  : 'z-0'
              }`}
              style={{
                top: `${idx * STACK_OFFSET}px`,
                left: `${idx * 3}px`,
                right: `${idx * 3}px`,
                height: `${Math.max(40, height - (MAX_VISIBLE_CARDS - 1) * STACK_OFFSET - idx * STACK_OFFSET)}px`,
                opacity: 1,
                filter: isTop ? 'none' : 'brightness(0.7)',
              }}
            >
              <div className="w-full h-full p-[2px]">
                <div className="w-full h-full rounded-[1.25rem] overflow-hidden">
                  <AppointmentCard
                    type={app.isTask ? 'TAREA' : 'CITA'}
                    dateTime={app.dateTime}
                    description={app.description}
                    status={app.status}
                    variant={variant}
                    vehicleDisplay={app.vehicleDisplay}
                    clientName={app.clientFullName}
                    isCompact={true}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* ── "+X más" Badge ── */}
        {hasOverflow && (
          <div
            className={`absolute z-30 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg backdrop-blur-md transition-all duration-300 group-hover/stack:scale-110 ${
              variant === 'blue'
                ? 'bg-blue-600/90 border-blue-400/40 text-white shadow-blue-500/20'
                : 'bg-red-600/90 border-red-400/40 text-white shadow-red-500/20'
            }`}
            style={{ top: '4px' }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {hiddenCount} más
          </div>
        )}

        {/* ── Hover glow effect ── */}
        <div className={`absolute inset-0 rounded-[1.25rem] pointer-events-none transition-opacity duration-500 opacity-0 group-hover/stack:opacity-100 ${
          variant === 'blue' ? 'shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'shadow-[0_0_30px_rgba(239,68,68,0.15)]'
        }`} />
      </div>

      {/* ── POPOVER — Expands in-place over the stack ── */}
      {isPopoverOpen && (
        <div
          ref={popoverRef}
          className="absolute z-[9999] animate-stack-expand"
          style={{
            bottom: '0',
            left: '-8px',
            right: '-8px',
            minWidth: 'calc(100% + 16px)',
          }}
          onMouseEnter={() => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
          }}
          onMouseLeave={() => {
            hoverTimerRef.current = setTimeout(() => setIsPopoverOpen(false), 400);
          }}
        >
          {/* Backdrop blur panel */}
          <div className={`relative rounded-[1.5rem] border backdrop-blur-xl overflow-hidden ${
            variant === 'blue'
              ? 'bg-neutral-950/97 border-blue-500/30 shadow-[0_8px_60px_rgba(59,130,246,0.25)]'
              : 'bg-neutral-950/97 border-red-500/30 shadow-[0_8px_60px_rgba(239,68,68,0.25)]'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800/60">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${variant === 'blue' ? 'bg-blue-500' : 'bg-red-500'}`} />
                <span className="text-[11px] font-black uppercase tracking-widest text-neutral-400">
                  {totalCount} {totalCount === 1 ? 'cita' : 'citas'} solapadas
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); closePopover(); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-white transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable appointment list */}
            <div className="max-h-[420px] overflow-y-auto custom-scrollbar p-3 space-y-2">
              {appointments.map((app) => (
                <div
                  key={app.id}
                  draggable={!readOnly}
                  onDragStart={(e) => handleCardDragStart(e, app)}
                  onDragEnd={handleCardDragEnd}
                  className={`relative rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02] ${
                    readOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
                  } group/popover-card`}
                >
                  <div className="rounded-xl overflow-hidden">
                    <AppointmentCard
                      type={app.isTask ? 'TAREA' : 'CITA'}
                      dateTime={app.dateTime}
                      description={app.description}
                      status={app.status}
                      variant={variant}
                      vehicleDisplay={app.vehicleDisplay}
                      clientName={app.clientFullName}
                      isCompact={true}
                    />
                  </div>

                  {/* Action buttons overlay on hover */}
                  <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover/popover-card:opacity-100 transition-opacity z-20">
                    <button
                      onClick={(e) => handleManageClick(e, app)}
                      className="w-7 h-7 bg-black/80 backdrop-blur-sm border border-white/15 text-white/70 rounded-full transition-all hover:bg-white hover:text-black shadow-xl flex items-center justify-center active:scale-95"
                      title="Gestionar Cita"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {app.status === 'PENDING' && onUpdateStatus && (
                      <button
                        onClick={(e) => handleConfirm(e, app)}
                        className="w-7 h-7 bg-green-500/20 backdrop-blur-sm border border-green-500/30 text-green-400 rounded-full transition-all hover:bg-green-500 hover:text-white shadow-xl flex items-center justify-center active:scale-95"
                        title="Confirmar"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}

                    {!readOnly && (
                      <button
                        onClick={(e) => handleDelete(e, app)}
                        className="w-7 h-7 bg-black/80 backdrop-blur-sm border border-red-500/30 text-red-400 rounded-full transition-all hover:bg-red-500 hover:text-white shadow-xl flex items-center justify-center active:scale-95"
                        title="Eliminar"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Expand-in-place animation ── */}
      <style>{`
        @keyframes stack-expand {
          0% {
            opacity: 0;
            transform: scaleY(0.4) scaleX(0.95);
            transform-origin: bottom center;
          }
          100% {
            opacity: 1;
            transform: scaleY(1) scaleX(1);
            transform-origin: bottom center;
          }
        }
        .animate-stack-expand {
          animation: stack-expand 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: bottom center;
        }
      `}</style>
    </div>
  );
};

