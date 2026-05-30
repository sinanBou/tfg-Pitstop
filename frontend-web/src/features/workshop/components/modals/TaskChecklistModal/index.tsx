import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { API_BASE_URL } from '@/config/api';
import { BaseModal } from '@/components/common/BaseModal/index';
import type { WorkshopInventory } from '@/types/client';

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
      const res = await fetch(`${API_BASE_URL}/workshop-tasks/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completedTasks: completedCodes }),
      });
      if (res.ok) {
        onSuccess?.();
      }
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

  // Load/save parts associated with this job via relational API
  interface LocalPart {
    id: string;
    partId: string;
    name: string;
    price: number;
    quantityUsed: number;
  }

  const [parts, setParts] = useState<LocalPart[]>([]);
  const [inventory, setInventory] = useState<WorkshopInventory[]>([]);
  const [selectedInvId, setSelectedInvId] = useState('');
  const [partQuery, setPartQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [quantityToUse, setQuantityToUse] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [addingPart, setAddingPart] = useState(false);

  const jobId = item?.originAppointmentId || item?.id;

  const filteredInventory = useMemo(() => {
    if (!partQuery.trim()) return inventory;
    const q = partQuery.toLowerCase();
    return inventory.filter(inv => 
      inv.part.name.toLowerCase().includes(q) || 
      (inv.part.oemReference && inv.part.oemReference.toLowerCase().includes(q))
    );
  }, [inventory, partQuery]);

  const loadInventory = useCallback(() => {
    const token = localStorage.getItem('jwt_token');
    fetch(`${API_BASE_URL}/parts/inventory`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then((data: WorkshopInventory[]) => {
        setInventory(data || []);
      })
      .catch(err => console.error("Error loading inventory:", err));
  }, []);

  const loadAssignedParts = useCallback(() => {
    if (!jobId) return;
    const token = localStorage.getItem('jwt_token');
    fetch(`${API_BASE_URL}/parts/appointments/${jobId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then((data: any[]) => {
        setParts((data || []).map(p => ({
          id: p.id,
          partId: p.part.id,
          name: p.part.name,
          price: p.appliedPrice,
          quantityUsed: p.quantityUsed
        })));
      })
      .catch(() => setParts([]));
  }, [jobId]);

  useEffect(() => {
    if (isOpen && jobId) {
      loadInventory();
      loadAssignedParts();
    }
  }, [isOpen, jobId, loadInventory, loadAssignedParts]);

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId || !partQuery.trim()) return;

    const matchedInv = inventory.find(i => i.id === selectedInvId || i.part.name.toLowerCase() === partQuery.trim().toLowerCase());

    if (quantityToUse <= 0) return;

    let payload: any = { quantity: quantityToUse };
    if (discountPercent > 0) {
      payload.discount = discountPercent / 100;
    }
    if (matchedInv) {
      if (matchedInv.stockQuantity < quantityToUse) {
        alert(`Stock insuficiente en almacén. Unidades disponibles: ${matchedInv.stockQuantity}`);
        return;
      }
      payload.partId = matchedInv.part.id;
    } else {
      payload.customName = partQuery.trim();
    }

    setAddingPart(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${API_BASE_URL}/parts/appointments/${jobId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(errMsg || 'Error al asignar repuesto');
      }

      loadInventory();
      loadAssignedParts();
      setSelectedInvId('');
      setPartQuery('');
      setQuantityToUse(1);
      setDiscountPercent(0);
      setShowDropdown(false);
      onSuccess?.();
    } catch (err: any) {
      alert(err.message || 'Error al guardar repuesto.');
    } finally {
      setAddingPart(false);
    }
  };

  const handleRemovePart = async (partId: string) => {
    if (!jobId) return;
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${API_BASE_URL}/parts/appointments/${jobId}/parts/${partId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        loadInventory();
        loadAssignedParts();
        onSuccess?.();
      }
    } catch (err) {
      console.error("Error removing part:", err);
    }
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
          <div className="w-full md:w-1/2 space-y-3 flex flex-col h-[260px]">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
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
          <div className="w-full md:w-1/2 space-y-3 flex flex-col h-[260px]">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
              Materiales y Repuestos Requeridos
            </h4>



            {/* Formulario rápido con buscador de autocompletado */}
            <form onSubmit={handleAddPart} className="flex gap-2 shrink-0 relative">
              <div className="relative flex-1 min-w-0">
                <input 
                  type="text"
                  required
                  value={partQuery}
                  onChange={e => {
                    setPartQuery(e.target.value);
                    setShowDropdown(true);
                    if (selectedInvId !== 'custom') setSelectedInvId('');
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Buscar o escribir repuesto..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs placeholder-neutral-600 focus:outline-none focus:border-red-500 transition-all font-semibold text-white"
                />
                
                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                    <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl z-50 divide-y divide-neutral-900 custom-scrollbar">
                      {filteredInventory.map(inv => (
                        <button
                          key={inv.id}
                          type="button"
                          onClick={() => {
                            setSelectedInvId(inv.id);
                            setPartQuery(inv.part.name);
                            setShowDropdown(false);
                          }}
                          disabled={inv.stockQuantity === 0}
                          className="w-full text-left px-3 py-2.5 text-xs hover:bg-neutral-900 flex justify-between items-center transition-all disabled:opacity-50"
                        >
                          <span className="text-white font-semibold">{inv.part.name}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {inv.stockQuantity} uds. - {inv.retailPrice.toFixed(2)}€
                          </span>
                        </button>
                      ))}
                      
                      {partQuery.trim().length > 0 && (
                        <button
                          key="custom-part-btn"
                          type="button"
                          onClick={() => {
                            setSelectedInvId('custom');
                            setShowDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2.5 text-xs bg-red-950/20 hover:bg-red-900/20 text-red-400 font-bold flex items-center gap-1.5 transition-all"
                        >
                          <span>Usar repuesto personalizado:</span>
                          <span className="text-white italic font-normal">"{partQuery.trim()}"</span>
                        </button>
                      )}
                      
                      {filteredInventory.length === 0 && partQuery.trim().length === 0 && (
                        <div className="px-3 py-3 text-center text-xs text-neutral-500 font-medium">
                          Escribe para buscar o añadir personalizado
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <input 
                type="number"
                required
                min="1"
                value={quantityToUse}
                onChange={e => setQuantityToUse(parseInt(e.target.value) || 1)}
                placeholder="Cant."
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-2 text-xs placeholder-neutral-600 focus:outline-none focus:border-red-500 transition-all w-16 shrink-0 font-mono font-medium text-center text-white"
              />
              
              <input 
                type="number"
                min="0"
                max="100"
                value={discountPercent || ''}
                onChange={e => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                placeholder="Desc. %"
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-2 text-xs placeholder-neutral-600 focus:outline-none focus:border-red-500 transition-all w-20 shrink-0 font-mono font-medium text-center text-white"
                title="Descuento opcional en porcentaje (0-100)"
              />

              <button
                type="submit"
                disabled={addingPart || !partQuery.trim()}
                className="px-2.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition-all flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(220,38,38,0.2)] active:scale-95 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </form>

            {/* Lista de repuestos consumidos */}
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
                    <div className="flex flex-col min-w-0">
                      <span className="text-white font-semibold truncate max-w-[170px]">{p.name}</span>
                      <span className="text-[10px] text-neutral-500 font-semibold">Cantidad: {p.quantityUsed} uds.</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {p.price <= 0 ? (
                        <span className="text-amber-500 font-black uppercase tracking-wider text-[9px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Precio Pendiente</span>
                      ) : (
                        <span className="text-neutral-400 font-mono">{(p.price * p.quantityUsed).toFixed(2)}€</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePart(p.partId)}
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
