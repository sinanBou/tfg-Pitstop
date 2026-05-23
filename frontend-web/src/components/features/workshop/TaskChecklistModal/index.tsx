import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { API_BASE_URL } from '../../../../config/api';
import { BaseModal } from '../../../common/BaseModal/index';

/* ─────────────────────────────────────────────
 *  TASK CHECKLIST MODAL
 *  Shows the individual sub-tasks (parsed from serviceType codes)
 *  for a vehicle appointment/task. The mechanic can check them
 *  off one by one; state is persisted via the completedTasks field.
 *  When all are completed the item can be marked as COMPLETED.
 *  It also allows registering parts to buy, persisting them dynamically.
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
  useEffect(() => {
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

  // Reset checklist when item changes
  useEffect(() => {
    setChecklist(parseServiceCodes(item?.serviceType, item?.completedTasks, catalogMap));
  }, [item?.serviceType, item?.completedTasks, catalogMap]);

  const completedCount = checklist.filter(i => i.completed).length;
  const totalCount = checklist.length;
  const allDone = totalCount > 0 && completedCount === totalCount;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  /** Persist completedTasks to the backend via PATCH */
  const persistCompletedTasks = useCallback(async (updatedList: ChecklistItem[]) => {
    if (!item?.isTask) return; // Only persist for WorkshopTasks (not plain appointments)
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

  // Load/save parts associated with this job via API
  const [parts, setParts] = useState<{ name: string; price: number | null }[]>([]);
  const [newPartName, setNewPartName] = useState('');
  const [newPartPrice, setNewPartPrice] = useState('');

  const jobId = item?.originAppointmentId || item?.id;

  // Load parts from the appointment's partsJson field
  useEffect(() => {
    if (isOpen && jobId) {
      const token = localStorage.getItem('jwt_token');
      fetch(`${API_BASE_URL}/appointments/workshop/${item.workshopId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then((appointments: any[]) => {
          const target = appointments.find((a: any) => a.id === jobId);
          if (target?.partsJson) {
            try {
              setParts(JSON.parse(target.partsJson));
            } catch {
              setParts([]);
            }
          } else {
            setParts([]);
          }
        })
        .catch(() => setParts([]));
    }
  }, [isOpen, jobId, item?.workshopId]);

  /** Persist parts to the backend */
  const persistPartsToApi = useCallback(async (updatedParts: { name: string; price: number | null }[]) => {
    if (!jobId) return;
    try {
      const token = localStorage.getItem('jwt_token');
      await fetch(`${API_BASE_URL}/appointments/${jobId}/parts`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ partsJson: JSON.stringify(updatedParts) }),
      });
    } catch {
      // Silent — non-critical
    }
  }, [jobId]);

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName.trim()) return;
    
    // Price is optional for the mechanic
    const price = newPartPrice.trim() !== '' ? parseFloat(newPartPrice) : null;
    if (price !== null && price < 0) return;

    const updated = [...parts, { name: newPartName.trim(), price }];
    setParts(updated);
    persistPartsToApi(updated);
    setNewPartName('');
    setNewPartPrice('');
  };

  const handleRemovePart = (index: number) => {
    const updated = parts.filter((_, i) => i !== index);
    setParts(updated);
    persistPartsToApi(updated);
  };

  if (!isOpen || !item) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={item.isTask ? 'Gestión de Tarea' : 'Gestión de Cita'}
      subtitle={item.vehicleDisplay}
      theme={item.isTask ? 'blue' : 'red'}
      progressBarWidth={`${progress}%`}
    >
      <div className="space-y-6 flex-1 flex flex-col justify-between h-full">
        {/* Info cabecera rápida */}
        <div className="bg-neutral-900/30 border border-neutral-800/60 rounded-2xl p-4 flex justify-between items-center text-xs shrink-0">
          <div className="flex gap-4">
            <div><span className="text-neutral-500 font-bold uppercase tracking-wider mr-1">Cliente:</span> <span className="text-white font-extrabold">{item.clientFullName}</span></div>
            <div><span className="text-neutral-500 font-bold uppercase tracking-wider mr-1">Duración:</span> <span className="text-white font-extrabold font-mono">{item.estimatedDuration || '--'} min</span></div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg">
            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Progreso:</span>
            <span className="text-white text-xs font-black">{completedCount}/{totalCount}</span>
          </div>
        </div>

        {/* Columnas Paralelas */}
        <div className="flex flex-col md:flex-row gap-6 items-start flex-1 min-h-0">
          {/* TAREAS (Izquierda) */}
          <div className="w-full md:w-1/2 space-y-3 flex flex-col h-[320px]">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Operaciones del Servicio
            </h4>
            
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
              {loadingCatalog ? (
                <div className="text-center py-12 text-neutral-500 flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-neutral-800 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-[9px] uppercase tracking-widest font-black">Mapeando tareas del catálogo...</p>
                </div>
              ) : checklist.length === 0 ? (
                <div className="text-center py-12 bg-neutral-900/10 border border-neutral-800/40 rounded-2xl p-4">
                  <p className="text-neutral-500 text-xs">No hay operaciones asignadas.</p>
                </div>
              ) : (
                checklist.map((ci) => (
                  <button
                    key={ci.code}
                    onClick={() => toggleItem(ci.code)}
                    className={`w-full text-left px-4 py-3 rounded-2xl border transition-all flex items-center gap-3 group/check ${
                      ci.completed
                        ? 'border-green-500/20 bg-green-600/5'
                        : 'border-neutral-800 bg-neutral-900/20 hover:border-neutral-700'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                      ci.completed
                        ? 'bg-green-600 border-green-600'
                        : 'border-neutral-600 group-hover/check:border-neutral-400'
                    }`}>
                      {ci.completed && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Task info */}
                    <div className="flex-1 min-w-0">
                      <span className={`text-[8px] font-black tracking-widest block leading-none ${
                        ci.completed ? 'text-green-500' : 'text-neutral-600'
                      }`}>
                        {ci.code}
                      </span>
                      <span className={`text-xs font-semibold block truncate transition-all ${
                        ci.completed ? 'text-green-400/60 line-through opacity-50' : 'text-white'
                      }`}>
                        {ci.label}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* PIEZAS Y REPUESTOS (Derecha) */}
          <div className="w-full md:w-1/2 space-y-3 flex flex-col h-[320px]">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Materiales y Repuestos Requeridos
            </h4>

            {/* Formulario rápido de piezas (el precio ya NO tiene required) */}
            <form onSubmit={handleAddPart} className="flex gap-2 shrink-0">
              <input 
                type="text"
                required
                value={newPartName}
                onChange={e => setNewPartName(e.target.value)}
                placeholder="Repuesto (ej: Pastillas de freno)"
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs placeholder-neutral-600 focus:outline-none focus:border-red-500 transition-all flex-1 min-w-0 font-medium"
              />
              <input 
                type="number"
                step="0.01"
                value={newPartPrice}
                onChange={e => setNewPartPrice(e.target.value)}
                placeholder="Precio (€)"
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-2 text-xs placeholder-neutral-600 focus:outline-none focus:border-red-500 transition-all w-20 shrink-0 font-mono font-medium text-center"
              />
              <button
                type="submit"
                className="px-2.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition-all flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(220,38,38,0.2)] active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </form>

            {/* Lista de repuestos */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar border border-neutral-800/80 rounded-2xl overflow-hidden divide-y divide-neutral-900 bg-neutral-950/20">
              {parts.length === 0 ? (
                <div className="text-center py-12 text-neutral-600 text-xs flex flex-col items-center justify-center p-4">
                  <svg className="w-8 h-8 text-neutral-800 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-[10px] font-bold uppercase tracking-wider">No se han registrado piezas</p>
                </div>
              ) : (
                parts.map((p, idx) => (
                  <div key={idx} className="bg-neutral-900/10 px-4 py-2.5 flex justify-between items-center text-xs">
                    <span className="text-white font-semibold truncate max-w-[150px]">{p.name}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      {p.price === null || p.price === undefined ? (
                        <span className="bg-yellow-600/10 border border-yellow-500/20 text-yellow-500 font-bold px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wider">Pte. Precio</span>
                      ) : (
                        <span className="text-neutral-400 font-mono">{p.price.toFixed(2)}€</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePart(idx)}
                        className="text-neutral-500 hover:text-red-400 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer / Botones */}
        <div className="mt-auto pt-6 border-t border-neutral-800/50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 rounded-xl border border-neutral-800 hover:border-neutral-700 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-all active:scale-95"
          >
            Cerrar
          </button>
          <button
            onClick={handleCompleteAll}
            disabled={!allDone || completing}
            className={`px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 ${
              allDone
                ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
            }`}
          >
            {completing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Marcar como Completado
              </>
            )}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};
