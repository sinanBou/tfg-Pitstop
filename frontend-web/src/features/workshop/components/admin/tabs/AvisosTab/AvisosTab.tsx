import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/api';
import type { WorkshopInventory } from '@/features/workshop';
import { BaseModal } from '@/components/common/BaseModal/BaseModal';
import { SearchableSelect } from '@/components/common/SearchableSelect/SearchableSelect';
import { Badge } from '@/components/common/Badge/Badge';
import { Button } from '@/components/common/Button/Button';
import { InputField } from '@/components/common/InputField/InputField';
import { AvisoMetricCard } from './AvisoMetricCard';
import { AvisoPanel } from './AvisoPanel';
import { useToast } from '@/hooks/useToast';
import { Calendar, Edit } from '@/assets/icons';

interface AvisosTabProps {
  workshopId: string;
  appointments: any[];
  readyJobs: any[];
  fetchWorkshopData: () => Promise<void>;
  onGoToPlanning?: () => void;
}

export const AvisosTab: React.FC<AvisosTabProps> = ({
  workshopId,
  appointments,
  readyJobs,
  fetchWorkshopData,
  onGoToPlanning,
}) => {
  const [inventory, setInventory] = useState<WorkshopInventory[]>([]);
  const [categories, setCategories] = useState<{ id: string; displayName: string }[]>([]);
  const [loadingInv, setLoadingInv] = useState(true);
  const toast = useToast();

  // Edit stock item state
  const [editingItem, setEditingItem] = useState<WorkshopInventory | null>(null);
  const [editOemRef, setEditOemRef] = useState('');
  const [editName, setEditName] = useState('');
  const [editManufacturer, setEditManufacturer] = useState('');
  const [editSpecs, setEditSpecs] = useState('');
  const [editCostPrice, setEditCostPrice] = useState('');
  const [editRetailPrice, setEditRetailPrice] = useState('');
  const [editStockQty, setEditStockQty] = useState('');
  const [editAvisoThreshold, setEditAvisoThreshold] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoadingInv(true);
      const token = localStorage.getItem('jwt_token');
      const [invRes, catsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/parts/workshop/${workshopId}/inventory`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/parts/workshop/${workshopId}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (invRes.ok) {
        const data = await invRes.json();
        setInventory(data || []);
      }
      if (catsRes.ok) {
        const catsData = await catsRes.json();
        setCategories(catsData || []);
      }
    } catch (err) {
      console.error('Error fetching inventory for warnings:', err);
    } finally {
      setLoadingInv(false);
    }
  };

  useEffect(() => {
    if (workshopId) {
      fetchInventory();
    }
  }, [workshopId]);

  const handleStartEdit = (item: WorkshopInventory) => {
    setEditingItem(item);
    setEditOemRef(item.part.oemReference || '');
    setEditName(item.part.name);
    setEditManufacturer(item.part.manufacturer || '');
    setEditSpecs(item.part.technicalSpecs || '');
    setEditCostPrice(item.costPrice.toString());
    setEditRetailPrice(item.retailPrice.toString());
    setEditStockQty(item.stockQuantity.toString());
    setEditAvisoThreshold(item.avisoThreshold.toString());
    setEditCategoryId(item.part.category.id);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editName.trim()) return;

    setSavingEdit(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const payload = {
        oemReference: editOemRef.trim(),
        name: editName.trim(),
        manufacturer: editManufacturer.trim() || 'Genérico',
        technicalSpecs: editSpecs.trim(),
        categoryId: editCategoryId,
        costPrice: parseFloat(editCostPrice) || 0.0,
        retailPrice: parseFloat(editRetailPrice) || 0.0,
        stockQuantity: parseInt(editStockQty) || 0,
        avisoThreshold: parseInt(editAvisoThreshold) || 5,
      };

      const res = await fetch(`${API_BASE_URL}/parts/inventory/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setEditingItem(null);
        await fetchInventory();
        await fetchWorkshopData();
      } else {
        const text = await res.text();
        toast.error(text || 'Error al guardar los cambios en el repuesto');
      }
    } catch (err) {
      console.error('Error saving edited item from warning:', err);
      toast.error('Ocurrió un error al intentar actualizar el stock');
    } finally {
      setSavingEdit(false);
    }
  };

  // Filter requested/pending appointments
  const pendingApps = appointments.filter((a) => a.status === 'PENDING');

  // Filter items that have reached or dropped below their aviso threshold
  const lowStockItems = inventory.filter((item) => item.stockQuantity <= item.avisoThreshold);

  const confirmedApps = appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS');

  // Delayed appointments list
  const dismissedWarnings = JSON.parse(localStorage.getItem('dismissed_delay_warnings') || '[]');
  const delayedApps = appointments.filter((a) => a.status === 'DELAYED' && !dismissedWarnings.includes(a.id));

  return (
    <div className="space-y-8 animate-fade-in-up relative">
      {/* Indicadores de cantidad arriba */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AvisoMetricCard 
          title="Solicitudes de Cita" 
          value={pendingApps.length} 
          alert={pendingApps.length > 0} 
        />
        <AvisoMetricCard 
          title="Citas Confirmadas" 
          value={confirmedApps.length} 
          alert={false} 
        />
        <AvisoMetricCard 
          title="Trabajos Finalizados" 
          value={readyJobs.length} 
          alert={false} 
        />
      </div>

      {/* Paneles de Stock y Retrasos - Uno al lado del otro */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* PANEL IZQUIERDO: RETRASOS DE CITAS Y TAREAS */}
        <AvisoPanel
          title="Retrasos de Citas y Tareas"
          badgeCount={delayedApps.length}
          badgeVariant="warning"
          indicatorColor="bg-amber-500"
          borderColor="border-amber-500/10"
          isEmpty={delayedApps.length === 0}
          emptyStateMessage="Sin retrasos registrados"
        >
          {delayedApps.map((app) => (
            <div
              key={app.id}
              className="bg-black/30 border border-neutral-800/80 p-5 rounded-2xl flex flex-col justify-between gap-4 group hover:border-amber-500/50 hover:bg-neutral-900/40 hover:scale-[1.01] shadow-sm hover:shadow-[0_0_20px_rgba(245,158,11,0.06)] transition-all relative overflow-hidden"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <Badge variant="warning">RETRASADO</Badge>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-bold">
                    {new Date(app.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} h
                  </span>
                </div>
                
                <h4 className="text-sm font-extrabold text-white group-hover:text-amber-500 transition-colors flex items-center gap-1.5 mt-2 uppercase">
                  {app.vehicleDisplay || 'Vehículo'}
                </h4>
                
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                  Cliente: {app.clientFullName || 'N/A'}
                </p>
                
                <p className="text-xs text-neutral-500 font-medium leading-relaxed italic border-t border-neutral-800/60 pt-2">
                  "{app.serviceType || 'Servicio'}: {app.description || 'Sin descripción'}"
                </p>
              </div>

              {onGoToPlanning && (
                <button
                  onClick={() => {
                    // 1. Eliminar el aviso de retraso del listado local
                    const currDismissed = JSON.parse(localStorage.getItem('dismissed_delay_warnings') || '[]');
                    localStorage.setItem('dismissed_delay_warnings', JSON.stringify([...currDismissed, app.id]));

                    // 2. Eliminar el bloqueo de hora fija para que pueda agendarse libremente
                    const currUnlocked = JSON.parse(localStorage.getItem('unlocked_appointments') || '[]');
                    localStorage.setItem('unlocked_appointments', JSON.stringify([...currUnlocked, app.id]));

                    // 3. Redirigir a planificación
                    onGoToPlanning();
                  }}
                  className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <Calendar className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Ir a Planificación
                </button>
              )}
            </div>
          ))}
        </AvisoPanel>

        {/* PANEL DERECHO: ALERTAS DE STOCK DE ALMACÉN */}
        <AvisoPanel
          title="Alertas de Stock de Almacén"
          badgeCount={lowStockItems.length}
          badgeVariant="danger"
          indicatorColor="bg-red-500"
          borderColor="border-red-500/10"
          isEmpty={lowStockItems.length === 0}
          emptyStateMessage="Todo el stock está correcto"
          isLoading={loadingInv}
          loadingMessage="Analizando existencias..."
        >
          {lowStockItems.map((item) => {
            const stockVal = item.stockQuantity;
            const threshVal = item.avisoThreshold || 1;
            const percent = Math.min(100, Math.max(0, (stockVal / (threshVal || 1)) * 100));
            const isCritical = stockVal === 0;

            return (
              <div
                key={item.id}
                onClick={() => handleStartEdit(item)}
                className="bg-black/30 border border-neutral-800/80 p-5 rounded-2xl flex flex-col gap-4 group hover:border-red-500/50 hover:bg-neutral-900/40 hover:scale-[1.01] shadow-sm hover:shadow-[0_0_20px_rgba(239,68,68,0.06)] transition-all cursor-pointer select-none"
                title="Haga clic para gestionar y editar este repuesto"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <Badge variant={isCritical ? 'danger' : 'neutral'}>
                      {isCritical ? 'CRÍTICO: SIN STOCK' : 'STOCK BAJO'}
                    </Badge>
                    <h4 className="text-sm font-extrabold text-white group-hover:text-red-500 transition-colors flex items-center gap-1.5 mt-2 truncate">
                      {item.part.name}
                      <Edit className="w-3.5 h-3.5 text-neutral-500 group-hover:text-red-500 opacity-40 group-hover:opacity-100 transition-all shrink-0" strokeWidth={2.5} />
                    </h4>
                    <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider truncate">
                      OEM: {item.part.oemReference || 'N/A'} • Fab: {item.part.manufacturer || 'N/A'}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-black text-white block">
                      {stockVal}{' '}
                      <span className="text-neutral-500 text-[10px] font-normal">
                        de {item.avisoThreshold} uds.
                      </span>
                    </span>
                    <span className="text-[8px] font-black uppercase text-neutral-500 block tracking-widest mt-1">
                      UMBRAL: {item.avisoThreshold}
                    </span>
                  </div>
                </div>

                {/* Barra de progreso de alerta */}
                <div className="space-y-1.5">
                  <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCritical ? 'bg-red-600' : 'bg-white/80'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider flex justify-between">
                    <span>Nivel de Stock actual</span>
                    <span className={isCritical ? 'text-red-500 font-black' : 'text-neutral-300 font-black'}>
                      {isCritical ? 'Agotado' : 'Haga clic para editar'}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </AvisoPanel>

      </div>

      {/* MODAL DE EDICIÓN DE STOCK DE ALMACÉN */}
      <BaseModal
        isOpen={editingItem !== null}
        onClose={() => setEditingItem(null)}
        title="Editar Repuesto"
        subtitle={editingItem ? `Categoría: ${editingItem.part.category.displayName}` : ''}
        theme="red"
      >
        {editingItem && (
          <form onSubmit={handleSaveEdit} className="space-y-6 flex-1 flex flex-col justify-between">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto pr-1 max-h-[360px] custom-scrollbar">
              {/* Seleccionable de Categoría / Carpeta */}
              <div className="md:col-span-2 space-y-1">
                <SearchableSelect
                  label="Mover a otra carpeta / categoría"
                  placeholder="Selecciona una carpeta o categoría..."
                  options={categories.map((c) => c.displayName)}
                  value={categories.find((c) => c.id === editCategoryId)?.displayName || ''}
                  onChange={(displayName) => {
                    const selected = categories.find((c) => c.displayName === displayName);
                    if (selected) {
                      setEditCategoryId(selected.id);
                    }
                  }}
                />
              </div>

              {/* Nombre */}
              <InputField
                label="Nombre del repuesto"
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="md:col-span-2"
              />

              {/* Referencia OEM */}
              <InputField
                label="Referencia OEM"
                type="text"
                value={editOemRef}
                onChange={(e) => setEditOemRef(e.target.value)}
              />

              {/* Fabricante */}
              <InputField
                label="Fabricante / Marca"
                type="text"
                value={editManufacturer}
                onChange={(e) => setEditManufacturer(e.target.value)}
              />

              {/* Ficha técnica */}
              <InputField
                label="Ficha Técnica / Especificaciones"
                multiline
                rows={3}
                value={editSpecs}
                onChange={(e) => setEditSpecs(e.target.value)}
                className="md:col-span-2"
              />

              {/* Cantidad Actual */}
              <InputField
                label="Stock actual"
                type="number"
                required
                value={editStockQty}
                onChange={(e) => setEditStockQty(e.target.value)}
              />

              {/* Umbral Mínimo */}
              <InputField
                label="Umbral de aviso"
                type="number"
                required
                value={editAvisoThreshold}
                onChange={(e) => setEditAvisoThreshold(e.target.value)}
              />

              {/* Precio Coste */}
              <InputField
                label="Precio de Coste (€)"
                type="number"
                required
                value={editCostPrice}
                onChange={(e) => setEditCostPrice(e.target.value)}
              />

              {/* Precio Venta */}
              <InputField
                label="Precio de Venta (€)"
                type="number"
                required
                value={editRetailPrice}
                onChange={(e) => setEditRetailPrice(e.target.value)}
              />
            </div>

            <div className="flex gap-4 pt-4 border-t border-neutral-800/60 mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditingItem(null)}
                className="w-1/2 !py-3"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={savingEdit}
                className="w-1/2 !py-3 bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(239,68,68,0.2)]"
              >
                {savingEdit ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        )}
      </BaseModal>
    </div>
  );
};
