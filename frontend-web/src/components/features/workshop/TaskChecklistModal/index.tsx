import React, { useState, useMemo, useCallback } from 'react';
import { API_BASE_URL } from '../../../../config/api';

/* ─────────────────────────────────────────────
 *  TASK CHECKLIST MODAL
 *  Shows the individual sub-tasks (parsed from serviceType codes)
 *  for a vehicle appointment/task. The mechanic can check them
 *  off one by one; state is persisted via the completedTasks field.
 *  When all are completed the item can be marked as COMPLETED.
 * ───────────────────────────────────────────── */

// ── Types ──
interface ChecklistItem {
  code: string;
  label: string;
  completed: boolean;
}

interface TaskChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The appointment or workshopTask being inspected */
  item: any;
  /** Callback to mark the whole item as COMPLETED */
  onUpdateStatus: (id: string, status: string, isTask?: boolean) => Promise<boolean | void>;
  /** Optional: refresh parent data after completion */
  onSuccess?: () => void;
}

/** Parse service codes and mark completed ones from persisted data */
function parseServiceCodes(
  serviceType: string | undefined, 
  completedTasks: string | undefined, 
  catalogMap: Map<string, string>
): ChecklistItem[] {
  if (!serviceType) return [];
  const completedSet = new Set(
    (completedTasks || '').split(',').map(c => c.trim()).filter(Boolean)
  );
  return serviceType
    .split(',')
    .map(c => c.trim())
    .filter(Boolean)
    .map(code => ({
      code,
      label: catalogMap.get(code) ?? code,
      completed: completedSet.has(code),
    }));
}

// ── Component ──
export const TaskChecklistModal: React.FC<TaskChecklistModalProps> = ({
  isOpen,
  onClose,
  item,
  onUpdateStatus,
  onSuccess,
}) => {
  const [catalogMap, setCatalogMap] = useState<Map<string, string>>(new Map());
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // Fetch catalog from database dynamically
  React.useEffect(() => {
    if (!isOpen || !item?.workshopId) return;

    setLoadingCatalog(true);
    const token = localStorage.getItem('jwt_token');
    fetch(`${API_BASE_URL}/catalog/workshop/${item.workshopId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then((data: any[]) => {
        const map = new Map<string, string>();
        data.forEach(cat => {
          (cat.tasks || []).forEach((t: any) => {
            map.set(t.code, t.name);
          });
        });
        setCatalogMap(map);
      })
      .catch(err => console.error("Error loading task catalog for checklist:", err))
      .finally(() => setLoadingCatalog(false));
  }, [isOpen, item?.workshopId]);

  const initialItems = useMemo(
    () => parseServiceCodes(item?.serviceType, item?.completedTasks, catalogMap),
    [item?.serviceType, item?.completedTasks, catalogMap]
  );
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialItems);
  const [completing, setCompleting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset checklist when item changes
  React.useEffect(() => {
    setChecklist(parseServiceCodes(item?.serviceType, item?.completedTasks, catalogMap));
  }, [item?.serviceType, item?.completedTasks, catalogMap]);

  const completedCount = checklist.filter(i => i.completed).length;
  const totalCount = checklist.length;
  const allDone = totalCount > 0 && completedCount === totalCount;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  /** Persist completedTasks to the backend via PATCH */
  const persistCompletedTasks = useCallback(async (updatedList: ChecklistItem[]) => {
    if (!item?.isTask) return; // Only persist for WorkshopTasks (not plain appointments)
    setSaving(true);
    try {
      const completedCodes = updatedList
        .filter(i => i.completed)
        .map(i => i.code)
        .join(', ');
      const token = localStorage.getItem('jwt_token');
      await fetch(`${API_BASE_URL}/workshop-tasks/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completedTasks: completedCodes }),
      });
    } catch {
      // Silent — non-critical, state is still in React
    } finally {
      setSaving(false);
    }
  }, [item?.id, item?.isTask]);

  const toggleItem = useCallback((code: string) => {
    setChecklist(prev => {
      const updated = prev.map(i => (i.code === code ? { ...i, completed: !i.completed } : i));
      persistCompletedTasks(updated);
      return updated;
    });
  }, [persistCompletedTasks]);

  const handleCompleteAll = async () => {
    if (!allDone || !item) return;
    setCompleting(true);
    try {
      await onUpdateStatus(item.id, 'COMPLETED', item.isTask);
      onSuccess?.();
      onClose();
    } catch {
      // Silently handle
    } finally {
      setCompleting(false);
    }
  };

  if (!isOpen || !item) return null;

  const dateObj = new Date(item.dateTime);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-neutral-800 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.9)] flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-300">

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-neutral-900 shrink-0">
          <div
            className={`h-full transition-all duration-500 ease-out rounded-r-full ${
              allDone
                ? 'bg-gradient-to-r from-green-600 to-green-400'
                : 'bg-gradient-to-r from-blue-600 to-blue-400'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-neutral-800/50 bg-neutral-950/20 shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full animate-pulse ${item.isTask ? 'bg-blue-500' : 'bg-red-500'}`} />
                <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">
                  {item.isTask ? 'Tarea' : 'Cita'} — Checklist
                </p>
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white truncate">
                {item.vehicleDisplay}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">
                  {item.clientFullName}
                </span>
                <span className="text-neutral-700">•</span>
                <span className="text-red-500 text-[11px] font-mono font-bold">
                  {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} h
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 text-neutral-500 hover:text-white hover:bg-neutral-800/50 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Tareas</span>
              <span className="text-white text-sm font-black">{completedCount}/{totalCount}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Duración</span>
              <span className="text-white text-sm font-black">{item.estimatedDuration || '--'} min</span>
            </div>
            {allDone && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-xl animate-pulse">
                <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Listo</span>
              </div>
            )}
          </div>
        </div>

        {/* Checklist body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-2">
          {loadingCatalog ? (
            <div className="text-center py-16 text-neutral-500 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-neutral-800 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-xs uppercase tracking-widest font-black">Cargando catálogo dinámico...</p>
            </div>
          ) : checklist.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-12 h-12 text-neutral-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-neutral-600 text-sm">No se encontraron sub-tareas para esta cita.</p>
              <p className="text-neutral-700 text-xs mt-1">El campo serviceType está vacío o no contiene códigos válidos.</p>
            </div>
          ) : (
            checklist.map((ci) => (
              <button
                key={ci.code}
                onClick={() => toggleItem(ci.code)}
                className={`w-full text-left px-4 py-3.5 rounded-2xl border transition-all flex items-center gap-3 group/check ${
                  ci.completed
                    ? 'border-green-500/30 bg-green-600/10'
                    : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                }`}
              >
                {/* Checkbox */}
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                  ci.completed
                    ? 'bg-green-600 border-green-600'
                    : 'border-neutral-600 group-hover/check:border-neutral-400'
                }`}>
                  {ci.completed && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Task info */}
                <div className="flex-1 min-w-0">
                  <span className={`text-[10px] font-black tracking-widest block ${
                    ci.completed ? 'text-green-500' : 'text-neutral-600'
                  }`}>
                    {ci.code}
                  </span>
                  <span className={`text-sm font-medium block truncate transition-all ${
                    ci.completed ? 'text-green-300 line-through opacity-60' : 'text-white'
                  }`}>
                    {ci.label}
                  </span>
                </div>

                {/* Status indicator */}
                <div className={`w-2 h-2 rounded-full shrink-0 transition-all ${
                  ci.completed ? 'bg-green-500' : 'bg-neutral-700'
                }`} />
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-neutral-800/50 shrink-0 space-y-3">
          {/* Completion button */}
          <button
            onClick={handleCompleteAll}
            disabled={!allDone || completing}
            className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              allDone
                ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]'
                : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
            }`}
          >
            {completing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : allDone ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Marcar como Completado
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Completa todas las tareas ({completedCount}/{totalCount})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
