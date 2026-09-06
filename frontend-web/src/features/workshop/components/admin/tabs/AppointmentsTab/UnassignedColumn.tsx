import React, { useState } from 'react';
import { getBrandLogo } from '@/assets/BrandLogos';
import { useToast } from '@/hooks/useToast';
import { ConfirmCardModal } from '@/components/common/ConfirmCardModal';
import { CheckCircle, Edit, Lock, FileText, X, GripVertical } from '@/assets/icons';
import { useTranslation } from '@/i18n';

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
  const { t } = useTranslation();
  const toast = useToast();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [confirmDeleteApp, setConfirmDeleteApp] = useState<UnassignedAppointment | null>(null);
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
      <span style="font-size:12px;font-weight:900;letter-spacing:0.5px;text-transform:uppercase">${app.vehicleDisplay || t('appointmentsTab.appointmentLabel')}</span>
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

  const handleDelete = (e: React.MouseEvent, app: UnassignedAppointment) => {
    e.stopPropagation();
    if (readOnly) return;
    setConfirmDeleteApp(app);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteApp) return;
    const app = confirmDeleteApp;
    setConfirmDeleteApp(null);
    if (app.isTask && onDeleteTask) {
      await onDeleteTask(app.id);
    } else if (onDeleteAppointment) {
      await onDeleteAppointment(app.id);
    }
  };

  return (
    <div
      style={{ width: columnWidth, height: gridHeight }}
      className="shrink-0 border-r border-slate-200 dark:border-neutral-800/60 relative flex flex-col bg-slate-50/40 dark:bg-neutral-950/20"
    >
      {/* Top hint bar */}
      <div className="px-3 py-2 bg-blue-50/70 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/30 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 select-none">
        <GripVertical className="w-3 h-3 shrink-0 opacity-60" />
        <span className="truncate">{t('appointmentsTab.dragToAssignHint')}</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12 opacity-50">
            <CheckCircle className="w-10 h-10 text-slate-400 dark:text-neutral-600 mb-3" strokeWidth={1.5} />
            <p className="text-slate-500 dark:text-neutral-600 text-[10px] font-black uppercase tracking-widest">
              {t('appointmentsTab.noUnassignedApps')}
            </p>
          </div>
        ) : (
          sorted.map((app) => {
            const dateObj = new Date(app.dateTime);
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            const day = dateObj.getDate().toString().padStart(2, '0');
            const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            const dateStr = `${day}/${month}`;
            const isDragging = draggedId === app.id;
            const isReceived = (app as any).vehicleReceived === true;

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
                  ${isDragging ? 'scale-95 opacity-40' : 'hover:scale-[1.01] hover:shadow-md'}
                  border border-transparent hover:border-blue-500/30
                `}
              >
                <div className={`bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-slate-200/90 dark:border-neutral-800/80 shadow-sm ${app.isTask ? 'border-l-[4px] border-l-emerald-500' : 'border-l-[4px] border-l-blue-500'}`}>
                  {/* Card header */}
                  <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50/80 dark:bg-neutral-800/40 border-b border-slate-100 dark:border-neutral-800/60">
                    <div className="flex items-center gap-1.5">
                      <GripVertical className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 cursor-grab" />
                      <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                        app.isTask
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                      }`}>
                        {app.isTask ? t('appointmentsTab.taskLabel') : t('appointmentsTab.appointmentLabel')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-800 dark:text-white text-[10px] font-black font-mono">
                      <span>{dateStr}</span>
                      <span className="text-slate-300 dark:text-neutral-600">·</span>
                      <span>{timeStr}</span>
                    </div>
                  </div>

                  {/* Vehicle & Client Info */}
                  <div className="px-3 py-2 space-y-1">
                    {app.vehicleDisplay && (
                      <div className="text-slate-900 dark:text-white font-black text-[13px] uppercase tracking-tight leading-snug truncate flex items-center gap-1.5">
                        <span className="shrink-0 flex items-center justify-center [&_svg]:w-3.5 [&_svg]:h-3.5 [&_div]:w-3.5 [&_div]:h-3.5 [&_div]:text-[7px]">
                          {getBrandLogo(app.vehicleDisplay.split(' ')[0])}
                        </span>
                        <span className="truncate">{app.vehicleDisplay}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      {app.clientFullName && (
                        <span className="text-slate-600 dark:text-neutral-400 text-[10px] font-bold truncate">
                          {app.clientFullName}
                        </span>
                      )}
                      {app.estimatedDuration && (
                        <span className="text-slate-700 dark:text-neutral-300 text-[9px] font-mono font-bold shrink-0 bg-slate-100 dark:bg-neutral-800/80 px-1.5 py-0.5 rounded-md border border-slate-200/60 dark:border-white/5">
                          {formatDuration(app.estimatedDuration)}
                        </span>
                      )}
                    </div>

                    {/* Reception badge */}
                    <div className="flex items-center gap-1 pt-0.5">
                      {isReceived ? (
                        <span className="text-[7px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-0.5">
                          En taller
                        </span>
                      ) : (
                        <span className="text-[7px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-0.5">
                          <Lock className="w-2 h-2" />
                          Sin recep.
                        </span>
                      )}
                    </div>

                    {app.description && (
                      <p className="text-slate-500 dark:text-neutral-500 text-[10px] italic line-clamp-1 mt-0.5">
                        "{app.description}"
                      </p>
                    )}
                  </div>

                  {/* Actions Bar on Hover */}
                  <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 dark:bg-neutral-950/70 border-t border-slate-100 dark:border-neutral-800/60 opacity-0 group-hover/card:opacity-100 transition-all duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isReceived) return;
                        onManage ? onManage(app) : toast.info(`${t('appointmentsTab.manage')}: ${app.vehicleDisplay}`);
                      }}
                      disabled={!isReceived}
                      className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                        isReceived
                          ? 'text-slate-700 dark:text-neutral-300 hover:text-white hover:bg-red-600 dark:hover:bg-red-600 cursor-pointer'
                          : 'text-amber-500/50 cursor-not-allowed'
                      }`}
                      title={isReceived ? t('appointmentsTab.manageTooltip') : t('appointmentsTab.receptionTooltip')}
                    >
                      {isReceived ? <Edit className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {isReceived ? t('appointmentsTab.manage') : t('appointmentsTab.reception')}
                    </button>

                    {app.isTask && app.serviceType && onViewChecklist && (
                      <button
                        onClick={(e) => { e.stopPropagation(); if (isReceived) onViewChecklist(app); }}
                        disabled={!isReceived}
                        className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                          isReceived
                            ? 'text-blue-500 dark:text-blue-400 hover:text-white hover:bg-blue-600 cursor-pointer'
                            : 'text-amber-500/40 cursor-not-allowed'
                        }`}
                        title={isReceived ? t('appointmentsTab.viewChecklistTooltip') : t('appointmentsTab.receptionTooltip')}
                      >
                        <FileText className="w-3 h-3" />
                      </button>
                    )}

                    {!readOnly && onUpdateStatus && (
                      <button
                        onClick={(e) => handleDelete(e, app)}
                        className="flex items-center justify-center w-7 h-7 rounded-lg text-red-500 hover:text-white hover:bg-red-600 transition-all cursor-pointer"
                        title={t('common.delete')}
                      >
                        <X className="w-3 h-3" strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {sorted.length > 0 && (
        <div className="sticky bottom-0 flex items-center justify-center py-2 bg-gradient-to-t from-white dark:from-neutral-900 via-white/80 dark:via-neutral-900/80 to-transparent pointer-events-none">
          <span className="px-3 py-1 bg-blue-500/15 border border-blue-500/30 rounded-full text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 shadow-sm">
            {sorted.length} {t('appointmentsTab.appointmentLabel')}
          </span>
        </div>
      )}
      {confirmDeleteApp && (
        <ConfirmCardModal
          isOpen={!!confirmDeleteApp}
          onClose={() => setConfirmDeleteApp(null)}
          onConfirm={handleConfirmDelete}
          title={confirmDeleteApp.isTask ? t('appointmentsTab.deleteTaskTitle') : t('appointmentsTab.deleteAppointmentTitle')}
          description={
            confirmDeleteApp.isTask
              ? t('appointmentsTab.deleteTaskDesc')
              : t('appointmentsTab.deleteUnassignedAppointmentDesc')
          }
          confirmText={t('appointmentsTab.confirmDelete')}
          theme="red"
        />
      )}
    </div>
  );
};
