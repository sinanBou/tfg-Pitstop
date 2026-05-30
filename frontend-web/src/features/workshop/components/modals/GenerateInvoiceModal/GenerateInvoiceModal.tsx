import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '@/config/api';
import { BaseModal } from '@/components/common/BaseModal/BaseModal';

interface PartItem {
  name: string;
  price: number | null;
  quantityUsed?: number;
}

interface ResolvedTask {
  code: string;
  name: string;
  hours: number;
}

interface GenerateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any; // Cita / AppointmentDTO
  onSuccess: () => void;
}

export const GenerateInvoiceModal: React.FC<GenerateInvoiceModalProps> = ({
  isOpen,
  onClose,
  job,
  onSuccess,
}) => {
  const [catalogMap, setCatalogMap] = useState<Map<string, { name: string; hours: number }>>(new Map());
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [parts, setParts] = useState<PartItem[]>([]);
  const [newPartName, setNewPartName] = useState('');
  const [newPartPrice, setNewPartPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  // Cargar piezas desde el campo parts (relacional) de la cita (servidor)
  useEffect(() => {
    if (isOpen && job?.id) {
      if (job.parts) {
        setParts(job.parts.map((p: any) => ({
          name: p.name,
          price: p.appliedPrice,
          quantityUsed: p.quantityUsed
        })));
      } else {
        setParts([]);
      }
      setNewPartName('');
      setNewPartPrice('');
    }
  }, [isOpen, job?.id, job?.parts]);

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

  /** Persist parts to the backend */
  const persistPartsToApi = async (updatedParts: PartItem[]) => {
    if (!job?.id) return;
    try {
      const token = localStorage.getItem('jwt_token');
      await fetch(`${API_BASE_URL}/appointments/${job.id}/parts`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ partsJson: JSON.stringify(updatedParts) }),
      });
    } catch {
      // Silent
    }
  };

  // Editar precio de una pieza inline
  const handleUpdatePartPrice = (index: number, value: string) => {
    const price = value.trim() !== '' ? parseFloat(value) : null;
    const updated = parts.map((p, i) => i === index ? { ...p, price } : p);
    setParts(updated);
    persistPartsToApi(updated);
  };

  const finalTotal = useMemo(() => {
    return totalLaborCost + totalPartsCost;
  }, [totalLaborCost, totalPartsCost]);

  // Agregar pieza
  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName.trim()) return;
    const price = parseFloat(newPartPrice) || 0;
    if (price < 0) return;

    const updated = [...parts, { name: newPartName.trim(), price }];
    setParts(updated);
    persistPartsToApi(updated);
    setNewPartName('');
    setNewPartPrice('');
  };

  // Eliminar pieza
  const handleRemovePart = (index: number) => {
    const updated = parts.filter((_, i) => i !== index);
    setParts(updated);
    persistPartsToApi(updated);
  };

  // Enviar factura a la API
  const handleConfirmInvoice = async () => {
    // Validación: todos los repuestos deben tener precio
    if (hasMissingPrices) {
      alert('Hay repuestos sin precio asignado. Por favor, completa todos los precios antes de confirmar.');
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
      alert(err.message || 'Error al completar el trabajo');
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
      <div className="space-y-6 flex-1 flex flex-col">
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
            
            {/* Formulario Agregar Pieza */}
            <form onSubmit={handleAddPart} className="flex gap-2">
              <input 
                type="text"
                required
                value={newPartName}
                onChange={e => setNewPartName(e.target.value)}
                placeholder="Repuesto (ej: Filtro de aceite)"
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-blue-500 transition-all flex-1 min-w-0"
              />
              <input 
                type="number"
                step="0.01"
                required
                value={newPartPrice}
                onChange={e => setNewPartPrice(e.target.value)}
                placeholder="Precio (€)"
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-blue-500 transition-all w-24 shrink-0 font-mono"
              />
              <button
                type="submit"
                className="px-3 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-extrabold text-xs transition-all flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </form>

            {/* Listado de Piezas */}
            {parts.length === 0 ? (
              <div className="text-center py-6 text-neutral-600 text-xs border border-dashed border-neutral-900 rounded-xl">
                Ninguno añadido aún.
              </div>
            ) : (
              <div className="border border-neutral-800/80 rounded-2xl overflow-hidden divide-y divide-neutral-900 max-h-[200px] overflow-y-auto custom-scrollbar">
                {hasMissingPrices && (
                  <div className="bg-yellow-600/10 border-b border-yellow-500/20 px-4 py-2 flex items-center gap-2 text-[10px] text-yellow-400 font-bold uppercase tracking-wider">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
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
                        onClick={() => handleRemovePart(idx)}
                        className="text-neutral-500 hover:text-red-400 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Confirmar y Avisar al Cliente
              </>
            )}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};
