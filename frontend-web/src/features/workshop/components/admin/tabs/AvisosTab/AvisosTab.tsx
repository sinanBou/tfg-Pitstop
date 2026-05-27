import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/api';
import type { WorkshopInventory } from '@/types/client';
import { BaseModal } from '@/components/common/BaseModal/index';
import { SearchableSelect } from '@/components/common/SearchableSelect/index';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { InputField } from '@/components/common/Input';
import { AvisoMetricCard } from './AvisoMetricCard';

interface AvisosTabProps {
  workshopId: string;
  appointments: any[];
  readyJobs: any[];
  fetchWorkshopData: () => Promise<void>;
}

export const AvisosTab: React.FC<AvisosTabProps> = ({
  workshopId,
  appointments,
  readyJobs,
  fetchWorkshopData,
}) => {
  const [inventory, setInventory] = useState<WorkshopInventory[]>([]);
  const [categories, setCategories] = useState<{ id: string; displayName: string }[]>([]);
  const [loadingInv, setLoadingInv] = useState(true);

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
        fetch(`${API_BASE_URL}/parts/inventory`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/parts/categories`, {
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
        alert(text || 'Error al guardar los cambios en el repuesto');
      }
    } catch (err) {
      console.error('Error saving edited item from warning:', err);
      alert('Ocurrió un error al intentar actualizar el stock');
    } finally {
      setSavingEdit(false);
    }
  };

  // Filter requested/pending appointments
  const pendingApps = appointments.filter((a) => a.status === 'PENDING');

  // Filter items that have reached or dropped below their aviso threshold
  const lowStockItems = inventory.filter((item) => item.stockQuantity <= item.avisoThreshold);

  const confirmedApps = appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS');

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

      {/* Alertas de Almacén debajo */}
      <Card variant="neutral" glow={false} padding="lg">
        <div className="flex items-center justify-between border-b border-neutral-800/60 pb-6 mb-6">
          <h3 className="text-white font-black uppercase tracking-wider text-xs flex items-center gap-2.5">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Alertas de Stock de Almacén
            <Badge variant="danger">{lowStockItems.length}</Badge>
          </h3>
        </div>

        {loadingInv ? (
          <div className="py-16 text-center text-neutral-500 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-neutral-800 border-t-red-500 rounded-full animate-spin" />
            <span className="text-[10px] uppercase tracking-widest font-black">
              Analizando existencias...
            </span>
          </div>
        ) : lowStockItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lowStockItems.map((item) => {
              const stockVal = item.stockQuantity;
              const threshVal = item.avisoThreshold || 1;
              const percent = Math.min(100, Math.max(0, (stockVal / (threshVal || 1)) * 100));
              const isCritical = stockVal === 0;

              return (
                <div
                  key={item.id}
                  onClick={() => handleStartEdit(item)}
                  className="bg-black/30 border border-neutral-800/80 p-5 rounded-2xl flex flex-col gap-4 group hover:border-red-500/50 hover:bg-neutral-900/40 hover:scale-[1.02] shadow-sm hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] transition-all cursor-pointer select-none"
                  title="Haga clic para gestionar y editar este repuesto"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <Badge variant={isCritical ? 'danger' : 'neutral'}>
                        {isCritical ? 'CRÍTICO: SIN STOCK' : 'STOCK BAJO'}
                      </Badge>
                      <h4 className="text-sm font-extrabold text-white group-hover:text-red-500 transition-colors flex items-center gap-1.5 mt-2">
                        {item.part.name}
                        <svg className="w-3.5 h-3.5 text-neutral-500 group-hover:text-red-500 opacity-40 group-hover:opacity-100 transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </h4>
                      <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">
                        OEM: {item.part.oemReference || 'N/A'} • Fab: {item.part.manufacturer || 'N/A'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-black text-white">
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
          </div>
        ) : (
          <div className="py-16 text-center text-neutral-500 text-[10px] uppercase tracking-widest font-black border border-dashed border-neutral-800 rounded-2xl">
            Todo el stock está correcto
          </div>
        )}
      </Card>

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

              {/* Stock Cantidad */}
              <InputField
                label="Cantidad en almacén"
                type="number"
                min="0"
                required
                value={editStockQty}
                onChange={(e) => setEditStockQty(e.target.value)}
                mono={true}
              />

              {/* Umbral Aviso */}
              <InputField
                label="Umbral de Aviso Mínimo"
                type="number"
                min="0"
                required
                value={editAvisoThreshold}
                onChange={(e) => setEditAvisoThreshold(e.target.value)}
                mono={true}
              />

              {/* Precio Coste */}
              <InputField
                label="Precio de Coste (€)"
                type="number"
                step="0.01"
                min="0"
                required
                value={editCostPrice}
                onChange={(e) => setEditCostPrice(e.target.value)}
                mono={true}
              />

              {/* Precio Venta */}
              <InputField
                label="Precio de Venta (€)"
                type="number"
                step="0.01"
                min="0"
                required
                value={editRetailPrice}
                onChange={(e) => setEditRetailPrice(e.target.value)}
                mono={true}
              />

              {/* Especificaciones */}
              <InputField
                label="Especificaciones Técnicas"
                multiline={true}
                rows={2}
                value={editSpecs}
                onChange={(e) => setEditSpecs(e.target.value)}
                className="md:col-span-2"
              />
            </div>

            <div className="flex gap-4 justify-end pt-5 border-t border-neutral-800/60 mt-auto shrink-0">
              <Button
                variant="secondary"
                onClick={() => setEditingItem(null)}
                className="px-6 h-12"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={savingEdit}
                variant="primary"
                glow={true}
                className="px-8 h-12"
              >
                {savingEdit ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-neutral-500 border-t-white rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </BaseModal>
    </div>
  );
};
