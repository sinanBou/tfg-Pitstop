import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, AlertTriangle, Trash, Check, Box } from '@/assets/icons';
import { API_BASE_URL } from '@/config/api';
import { BaseModal } from '@/components/common/BaseModal/BaseModal';
import { useToast } from '@/hooks/useToast';


/**
 * Representa una pieza de repuesto agregada manualmente o importada para la facturación.
 */
interface PartItem {
  /** Identificador único de la pieza en catálogo (opcional). */
  partId?: string;
  /** Nombre descriptivo del repuesto. */
  name: string;
  /** Precio de venta asignado a la pieza, o null si está pendiente de cotización. */
  price: number | null;
  /** Cantidad utilizada (opcional). Por defecto 1. */
  quantityUsed?: number;
}

/**
 * Representa una tarea de catálogo resuelta y valorada para la liquidación.
 */
interface ResolvedTask {
  /** Código único del servicio. */
  code: string;
  /** Nombre comercial o descripción de la tarea. */
  name: string;
  /** Número de horas asignado para la tarea. */
  hours: number;
}

/**
 * Propiedades del componente GenerateInvoiceModal.
 */
interface GenerateInvoiceModalProps {
  /** Determina si la modal está abierta. */
  isOpen: boolean;
  /** Callback para cerrar la modal. */
  onClose: () => void;
  /** Objeto de la cita (AppointmentDTO) finalizada que se va a facturar. */
  job: any;
  /** Callback que se ejecuta cuando la factura se crea con éxito en el servidor. */
  onSuccess: () => void;
}

/**
 * Modal para el registro final de facturas y liquidación de servicios.
 * Permite desglosar las horas de mano de obra según los códigos de servicios de la cita,
 * añadir repuestos adicionales utilizados durante la reparación (con precios ajustables)
 * y registrar la factura final en el backend, gatillando notificaciones de recogida de vehículo.
 */
export const GenerateInvoiceModal: React.FC<GenerateInvoiceModalProps> = ({
  isOpen,
  onClose,
  job,
  onSuccess,
}) => {
  const [catalogMap, setCatalogMap] = useState<Map<string, { name: string; hours: number }>>(new Map());
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [parts, setParts] = useState<PartItem[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [selectedInvId, setSelectedInvId] = useState('');
  const [partQuery, setPartQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [quantityToUse, setQuantityToUse] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [addingPart, setAddingPart] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  // Cargar catálogo para traducir los códigos
  useEffect(() => {
    if (!isOpen || !job?.workshopId) return;

    setLoadingCatalog(true);
    const token = localStorage.getItem('jwt_token');
    fetch(`${API_BASE_URL}/catalog/workshop/${job.workshopId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then((data: any[]) => {
        const map = new Map<string, { name: string; hours: number }>();
        data.forEach(cat => {
          (cat.tasks || []).forEach((t: any) => {
            map.set(t.code, { name: t.name, hours: t.hours || 1.0 });
          });
        });
        setCatalogMap(map);
      })
      .catch(err => console.error("Error loading task catalog for invoice:", err))
      .finally(() => setLoadingCatalog(false));
  }, [isOpen, job?.workshopId]);

  // Cargar inventario del taller
  const loadInventory = useCallback(() => {
    if (!job?.workshopId) return;
    const token = localStorage.getItem('jwt_token');
    fetch(`${API_BASE_URL}/parts/workshop/${job.workshopId}/inventory`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then((data: any[]) => {
        setInventory(data || []);
      })
      .catch(err => console.error("Error loading inventory for invoice:", err));
  }, [job?.workshopId]);

  // Cargar repuestos asignados a la cita
  const loadAssignedParts = useCallback(() => {
    if (!job?.id) return;
    const token = localStorage.getItem('jwt_token');
    fetch(`${API_BASE_URL}/parts/appointments/${job.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then((data: any[]) => {
        setParts((data || []).map(p => ({
          partId: p.part.id,
          name: p.part.name,
          price: p.appliedPrice,
          quantityUsed: p.quantityUsed
        })));
      })
      .catch(() => setParts([]));
  }, [job?.id]);

  // Efecto de inicialización al abrir la modal
  useEffect(() => {
    if (isOpen && job?.id) {
      loadInventory();
      loadAssignedParts();
      setPartQuery('');
      setSelectedInvId('');
      setQuantityToUse(1);
      setDiscountPercent(0);
    }
  }, [isOpen, job?.id, job?.workshopId, loadInventory, loadAssignedParts]);

  // Traducir los códigos del servicio de la cita
  const resolvedTasks = useMemo<ResolvedTask[]>(() => {
    if (!job?.serviceType) return [];
    return job.serviceType
      .split(',')
      .map((c: string) => c.trim())
      .filter(Boolean)
      .map((code: string) => {
        const catalogInfo = catalogMap.get(code);
        return {
          code,
          name: catalogInfo?.name || code,
          hours: catalogInfo?.hours || 1.0,
        };
      });
  }, [job?.serviceType, catalogMap]);

  // Filtrado de inventario en tiempo real
  const filteredInventory = useMemo(() => {
    if (!partQuery.trim()) return inventory;
    const q = partQuery.toLowerCase();
    return inventory.filter(inv => 
      inv.part.name.toLowerCase().includes(q) || 
      (inv.part.oemReference && inv.part.oemReference.toLowerCase().includes(q))
    );
  }, [inventory, partQuery]);

  // Cálculos en tiempo real
  const totalLaborHours = useMemo(() => {
    return resolvedTasks.reduce((sum, t) => sum + t.hours, 0);
  }, [resolvedTasks]);

  const laborRate = job?.workshopHourlyRate || 40.0;
  const totalLaborCost = useMemo(() => {
    return totalLaborHours * laborRate;
  }, [totalLaborHours, laborRate]);

  const totalPartsCost = useMemo(() => {
    return parts.reduce((sum, p) => sum + ((p.price ?? 0) * (p.quantityUsed ?? 1)), 0);
  }, [parts]);

  const hasMissingPrices = useMemo(() => {
    return parts.some(p => p.price === null || p.price === undefined || p.price <= 0);
  }, [parts]);

  const finalTotal = useMemo(() => {
    return totalLaborCost + totalPartsCost;
  }, [totalLaborCost, totalPartsCost]);

  // Editar precio de una pieza inline (solo actualiza el estado local para el envío de factura)
  const handleUpdatePartPrice = (index: number, value: string) => {
    const price = value.trim() !== '' ? parseFloat(value) : null;
    const updated = parts.map((p, i) => i === index ? { ...p, price } : p);
    setParts(updated);
  };

  // Agregar pieza usando los endpoints reales
  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job?.id || !partQuery.trim()) return;

    const matchedInv = inventory.find(
      i => i.id === selectedInvId || i.part.name.toLowerCase() === partQuery.trim().toLowerCase()
    );

    if (quantityToUse <= 0) return;

    let payload: any = { quantity: quantityToUse };
    if (discountPercent > 0) {
      payload.discount = discountPercent / 100;
    }
    if (matchedInv) {
      if (matchedInv.stockQuantity < quantityToUse) {
        toast.warning(`Stock insuficiente en almacén. Unidades disponibles: ${matchedInv.stockQuantity}`);
        return;
      }
      payload.partId = matchedInv.part.id;
    } else {
      payload.customName = partQuery.trim();
    }

    setAddingPart(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${API_BASE_URL}/parts/appointments/${job.id}`, {
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
      toast.success('Repuesto agregado con éxito.');
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar repuesto.');
    } finally {
      setAddingPart(false);
    }
  };

  // Eliminar pieza usando los endpoints reales
  const handleRemovePart = async (partId?: string) => {
    if (!job?.id || !partId) return;
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${API_BASE_URL}/parts/appointments/${job.id}/parts/${partId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        loadInventory();
        loadAssignedParts();
        toast.success('Repuesto eliminado con éxito.');
      } else {
        const errMsg = await res.text();
        throw new Error(errMsg || 'Error al eliminar repuesto');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar repuesto.');
    }
  };

  // Enviar factura a la API
  const handleConfirmInvoice = async () => {
    // Validación: todos los repuestos deben tener precio
    if (hasMissingPrices) {
      toast.error('Hay repuestos sin precio asignado. Por favor, completa todos los precios antes de confirmar.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${API_BASE_URL}/invoices`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: job.id,
          workshopId: job.workshopId,
          laborRate: laborRate,
          totalLabor: totalLaborCost,
          partsJson: JSON.stringify(parts),
          totalParts: totalPartsCost,
          totalPrice: finalTotal,
        }),
      });

      if (!res.ok) throw new Error('Error al registrar la factura');
      
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error al completar el trabajo');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Resumen de Facturación"
      subtitle="Liquidación de Servicio"
      theme="green"
    >
      <div className="space-y-6 flex-1 flex flex-col animate-none">
        {/* Info Cita */}
        <div className="bg-neutral-900/30 border border-neutral-800/60 rounded-2xl p-5 space-y-3 shrink-0">
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-500 font-bold uppercase tracking-wider">Vehículo</span>
            <span className="text-white font-extrabold">{job?.vehicleDisplay}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-500 font-bold uppercase tracking-wider">Cliente</span>
            <span className="text-white font-extrabold">{job?.clientFullName}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-500 font-bold uppercase tracking-wider">Tarifa de Mano de Obra</span>
            <span className="text-green-400 font-extrabold">{laborRate.toFixed(2)}€ / hora</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start flex-1">
          {/* Mano de Obra (Izquierda) */}
          <div className="w-full md:w-1/2 space-y-3 bg-neutral-900/10 border border-neutral-800/60 rounded-2xl p-5">
            <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400">Mano de Obra</h4>
            
            {loadingCatalog ? (
              <div className="text-center py-6 text-neutral-500 text-xs font-bold uppercase tracking-wider animate-pulse">
                Cargando tiempos del catálogo...
              </div>
            ) : resolvedTasks.length === 0 ? (
              <div className="text-center py-6 text-neutral-500 text-xs border border-dashed border-neutral-800 rounded-xl">
                No hay tareas específicas mapeadas. Se aplicará mano de obra base.
              </div>
            ) : (
              <div className="border border-neutral-800/80 rounded-2xl overflow-hidden divide-y divide-neutral-900">
                {resolvedTasks.map((t, idx) => (
                  <div key={idx} className="bg-neutral-900/10 px-4 py-3 flex justify-between items-center text-sm">
                    <div>
                      <p className="text-white font-bold text-xs">{t.name}</p>
                      <p className="text-[9px] text-neutral-500 font-mono mt-0.5">CÓDIGO: {t.code}</p>
                    </div>
                    <span className="text-neutral-400 font-mono text-xs">{t.hours.toFixed(2)}h</span>
                  </div>
                ))}
                <div className="bg-neutral-900/40 px-4 py-3 flex justify-between items-center text-xs font-black uppercase tracking-widest text-neutral-300">
                  <span>Total Horas</span>
                  <span className="text-white font-mono">{totalLaborHours.toFixed(2)}h ({totalLaborCost.toFixed(2)}€)</span>
                </div>
              </div>
            )}
          </div>

          {/* Repuestos / Piezas Compradas (Derecha) */}
          <div className="w-full md:w-1/2 space-y-4 bg-neutral-900/10 border border-neutral-800/60 rounded-2xl p-5">
            <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400">Piezas y Repuestos</h4>
            
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
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs placeholder-neutral-600 focus:outline-none focus:border-green-500 transition-all font-semibold text-white animate-none"
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
                          className="w-full text-left px-3 py-2.5 text-xs bg-green-950/20 hover:bg-green-900/20 text-green-400 font-bold flex items-center gap-1.5 transition-all"
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
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-2.5 text-xs placeholder-neutral-600 focus:outline-none focus:border-green-500 transition-all w-16 shrink-0 font-mono font-medium text-center text-white"
              />
              
              <input 
                type="number"
                min="0"
                max="100"
                value={discountPercent || ''}
                onChange={e => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                placeholder="Desc. %"
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-2.5 text-xs placeholder-neutral-600 focus:outline-none focus:border-green-500 transition-all w-20 shrink-0 font-mono font-medium text-center text-white"
                title="Descuento opcional en porcentaje (0-100)"
              />

              <button
                type="submit"
                disabled={addingPart || !partQuery.trim()}
                className="px-3 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-extrabold text-xs transition-all flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(34,197,94,0.3)] active:scale-95 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Listado de Piezas */}
            {parts.length === 0 ? (
              <div className="text-center py-12 text-neutral-600 text-xs flex flex-col items-center justify-center border border-dashed border-neutral-900 rounded-xl">
                <Box className="w-8 h-8 text-neutral-800 mb-1" strokeWidth={1.5} />
                <p className="text-[10px] font-bold uppercase tracking-wider">Ninguno añadido aún.</p>
              </div>
            ) : (
              <div className="border border-neutral-800/80 rounded-2xl overflow-hidden divide-y divide-neutral-900 max-h-[200px] overflow-y-auto custom-scrollbar">
                {hasMissingPrices && (
                  <div className="bg-yellow-600/10 border-b border-yellow-500/20 px-4 py-2 flex items-center gap-2 text-[10px] text-yellow-400 font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Hay repuestos sin precio — Introduce el importe para poder confirmar
                  </div>
                )}
                {parts.map((p, idx) => (
                  <div key={idx} className={`px-4 py-3 flex justify-between items-center text-xs ${
                    p.price === null || p.price === undefined || p.price <= 0
                      ? 'bg-yellow-600/5 border-l-2 border-l-yellow-500'
                      : 'bg-neutral-900/10'
                  }`}>
                    <div className="flex flex-col min-w-0">
                      <span className="text-white font-medium truncate max-w-[130px]">{p.name}</span>
                      <span className="text-[10px] text-neutral-500 font-semibold">Cant: {p.quantityUsed ?? 1} uds.</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {p.price === null || p.price === undefined || p.price <= 0 ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="bg-neutral-900 border border-yellow-500/40 rounded-lg px-2 py-1 text-white text-xs font-mono w-20 text-center focus:outline-none focus:border-yellow-400 transition-all"
                            onBlur={e => handleUpdatePartPrice(idx, e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                          />
                          <span className="text-yellow-500 text-[10px] font-bold">€</span>
                        </div>
                      ) : (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          defaultValue={p.price.toFixed(2)}
                          className="bg-transparent border border-transparent hover:border-neutral-700 focus:border-green-500 rounded-lg px-2 py-1 text-neutral-400 text-xs font-mono w-20 text-right focus:outline-none focus:text-white transition-all"
                          onBlur={e => handleUpdatePartPrice(idx, e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePart(p.partId)}
                        className="text-neutral-500 hover:text-red-400 transition-all"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="bg-neutral-900/40 px-4 py-3 flex justify-between items-center text-xs font-black uppercase tracking-widest text-neutral-300">
                  <span>Total Repuestos</span>
                  <span className="text-white font-mono">{totalPartsCost.toFixed(2)}€</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resumen Total */}
        <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
          <div className="flex gap-6 text-xs text-neutral-400 font-bold uppercase tracking-wider">
            <div>Mano de Obra: <span className="font-mono text-white ml-1">{totalLaborCost.toFixed(2)}€</span></div>
            <div>Repuestos: <span className="font-mono text-white ml-1">{totalPartsCost.toFixed(2)}€</span></div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-neutral-400 text-xs font-bold uppercase tracking-wider">Total (PVP):</span>
            <span className="text-green-400 text-2xl font-mono font-black">{finalTotal.toFixed(2)}€</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-6 border-t border-neutral-800/50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 rounded-xl border border-neutral-800 hover:border-neutral-700 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmInvoice}
            disabled={submitting || hasMissingPrices}
            className={`px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 ${
              hasMissingPrices
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.3)] disabled:opacity-50'
            }`}
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                Confirmar y Avisar al Cliente
              </>
            )}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};
