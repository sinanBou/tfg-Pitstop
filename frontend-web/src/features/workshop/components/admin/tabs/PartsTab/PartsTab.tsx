import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '@/config/api';
import type { WorkshopInventory, PartCategory } from '@/features/workshop';
import { CategoryHeader } from '../shared/CategoryHeader';
import { AddCategoryForm } from '../shared/AddCategoryForm';
import { TabHeader } from '../shared/TabHeader';
import { PartFormInline } from './components/PartFormInline';
import { PartItemRow } from './components/PartItemRow';
import { Card } from '@/components/common/Card/Card';
import { useToast } from '@/hooks/useToast';
import { ConfirmCardModal } from '@/components/common/ConfirmCardModal';
import { Search, X } from '@/assets/icons';
import { useTranslation } from '@/i18n';

/**
 * Propiedades del componente PartsTab.
 */
interface PartsTabProps {
  /** Identificador del taller para consultar y actualizar el catálogo de repuestos e inventario. */
  workshopId: string;
}

/**
 * Pestaña de Almacén/Repuestos en el panel de Administración de Taller.
 * Gestiona el inventario de partes mecánicas agrupado por carpetas/categorías.
 * Soporta la creación de categorías, el filtrado/búsqueda en tiempo real (OEM, fabricante, nombre),
 * la inserción en línea de repuestos y su posterior modificación (stock, precio coste, precio venta, umbral de alerta).
 */
export const PartsTab: React.FC<PartsTabProps> = ({ workshopId }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [categories, setCategories] = useState<PartCategory[]>([]);
  const [inventory, setInventory] = useState<WorkshopInventory[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and expand states
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Adding category states
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  // Adding part under a category states
  const [addingPartCategoryId, setAddingPartCategoryId] = useState<string | null>(null);
  const [newOemRef, setNewOemRef] = useState('');
  const [newName, setNewName] = useState('');
  const [newManufacturer, setNewManufacturer] = useState('');
  const [newSpecs, setNewSpecs] = useState('');
  const [newCostPrice, setNewCostPrice] = useState('');
  const [newRetailPrice, setNewRetailPrice] = useState('');
  const [newStockQty, setNewStockQty] = useState('10');
  const [newAvisoThreshold, setNewAvisoThreshold] = useState('5');
  const [addingPart, setAddingPart] = useState(false);

  // Editing part states
  const [editingItem, setEditingItem] = useState<WorkshopInventory | null>(null);
  const [editOemRef, setEditOemRef] = useState('');
  const [editName, setEditName] = useState('');
  const [editManufacturer, setEditManufacturer] = useState('');
  const [editSpecs, setEditSpecs] = useState('');
  const [editCostPrice, setEditCostPrice] = useState('');
  const [editRetailPrice, setEditRetailPrice] = useState('');
  const [editStockQty, setEditStockQty] = useState('');
  const [editAvisoThreshold, setEditAvisoThreshold] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'part' | 'category' | null;
    id: string | null;
    title: string;
    description: string;
    confirmText?: string;
    theme?: 'red' | 'blue' | 'green' | 'amber';
  } | null>(null);

  const handleConfirmAction = async () => {
    if (!confirmModal || !confirmModal.id) return;
    const { type, id } = confirmModal;
    setConfirmModal(null);

    if (type === 'part') {
      try {
        const token = localStorage.getItem('jwt_token');
        const res = await fetch(`${API_BASE_URL}/parts/inventory/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('No se pudo eliminar el repuesto');
        toast.success('Repuesto eliminado con éxito del almacén.');
        await fetchData();
      } catch (err: any) {
        toast.error(err.message);
      }
    } else if (type === 'category') {
      try {
        const token = localStorage.getItem('jwt_token');
        const res = await fetch(`${API_BASE_URL}/parts/categories/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('No se pudo eliminar la categoría (comprueba que no contenga repuestos)');
        toast.success('Categoría eliminada con éxito.');
        await fetchData();
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      
      const [catsRes, invRes] = await Promise.all([
        fetch(`${API_BASE_URL}/parts/workshop/${workshopId}/categories`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/parts/workshop/${workshopId}/inventory`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      if (!catsRes.ok || !invRes.ok) throw new Error('Error al cargar datos del almacén');
      
      const catsData = await catsRes.json();
      const invData = await invRes.json();
      
      setCategories(catsData || []);
      setInventory(invData || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workshopId) {
      fetchData();
    }
  }, [workshopId]);

  // Expand category toggle
  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // Grouped and filtered inventory
  const groupedInventory = useMemo(() => {
    const groups: Record<string, WorkshopInventory[]> = {};
    
    // Initialize groups for all categories
    categories.forEach(cat => {
      groups[cat.id] = [];
    });
    
    // Group physical inventory items
    inventory.forEach(item => {
      const catId = item.part.category?.id;
      if (catId) {
        if (!groups[catId]) groups[catId] = [];
        groups[catId].push(item);
      }
    });

    // Filter by search term
    const filteredGroups: Record<string, WorkshopInventory[]> = {};
    Object.keys(groups).forEach(catId => {
      const cat = categories.find(c => c.id === catId);
      const catMatches = cat?.displayName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchedItems = groups[catId].filter(item => 
        item.part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.part.oemReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.part.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (catMatches || matchedItems.length > 0) {
        filteredGroups[catId] = matchedItems;
      }
    });

    return filteredGroups;
  }, [categories, inventory, searchTerm]);

  // Create Category Handler
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setAddingCategory(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${API_BASE_URL}/parts/workshop/${workshopId}/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ displayName: newCategoryName.trim() })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'No se pudo crear la categoría');
      }
      
      setNewCategoryName('');
      setShowAddCategory(false);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAddingCategory(false);
    }
  };

  // Create Part Handler (nested under selected category)
  const handleCreatePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingPartCategoryId || !newName.trim()) return;

    setAddingPart(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const payload = {
        oemReference: newOemRef.trim(),
        name: newName.trim(),
        manufacturer: newManufacturer.trim() || 'Genérico',
        technicalSpecs: newSpecs.trim(),
        categoryId: addingPartCategoryId,
        costPrice: parseFloat(newCostPrice) || 0.0,
        retailPrice: parseFloat(newRetailPrice) || 0.0,
        stockQuantity: parseInt(newStockQty) || 0,
        avisoThreshold: parseInt(newAvisoThreshold) || 5
      };

      const res = await fetch(`${API_BASE_URL}/parts/workshop/${workshopId}/inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'No se pudo añadir el repuesto al almacén');
      }
      
      // Reset form
      setNewOemRef('');
      setNewName('');
      setNewManufacturer('');
      setNewSpecs('');
      setNewCostPrice('');
      setNewRetailPrice('');
      setNewStockQty('10');
      setNewAvisoThreshold('5');
      setAddingPartCategoryId(null);
      
      await fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAddingPart(false);
    }
  };

  // Edit initialization
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
  };

  // Save edit handler
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
        categoryId: editingItem.part.category.id,
        costPrice: parseFloat(editCostPrice) || 0.0,
        retailPrice: parseFloat(editRetailPrice) || 0.0,
        stockQuantity: parseInt(editStockQty) || 0,
        avisoThreshold: parseInt(editAvisoThreshold) || 5
      };

      const res = await fetch(`${API_BASE_URL}/parts/inventory/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'No se pudo guardar la modificación');
      }
      
      setEditingItem(null);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete inventory handler
  const handleDeletePart = (id: string) => {
    setConfirmModal({
      isOpen: true,
      type: 'part',
      id,
      title: t('partsTab.deletePartTitle'),
      description: t('partsTab.deletePartDesc'),
      confirmText: t('common.confirm'),
      theme: 'red'
    });
  };

  // Delete Category Handler
  const handleDeleteCategory = (e: React.MouseEvent, categoryId: string) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      type: 'category',
      id: categoryId,
      title: t('partsTab.deleteCatTitle'),
      description: t('partsTab.deleteCatDesc'),
      confirmText: t('common.confirm'),
      theme: 'red'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-500 gap-4">
        <div className="w-12 h-12 border-2 border-neutral-800 border-t-red-600 rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest font-black">{t('partsTab.loadingInventory')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white animate-fade-in-up select-none">
      {/* Title Block */}
      <TabHeader
        title={t('partsTab.title')}
        subtitle={t('partsTab.subtitle')}
        actionLabel={t('partsTab.newCategoryBtn')}
        onActionClick={() => setShowAddCategory(!showAddCategory)}
        colorVariant="red"
      />

      {/* Search Input Bar */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search className="w-5 h-5 text-neutral-500" />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={t('partsTab.searchPlaceholder')}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-12 pr-12 py-3.5 text-white text-xs focus:outline-none focus:border-red-500/50 focus:bg-black/40 transition-all placeholder-neutral-500 font-semibold"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-500 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Add Category Form Panel */}
      {showAddCategory && (
        <AddCategoryForm
          title={t('partsTab.createCategoryTitle')}
          label={t('partsTab.categoryNameLabel')}
          placeholder={t('partsTab.categoryNamePlaceholder')}
          value={newCategoryName}
          onChange={setNewCategoryName}
          onSubmit={handleCreateCategory}
          onCancel={() => setShowAddCategory(false)}
          submitting={addingCategory}
          colorVariant="red"
        />
      )}

      {/* Categories Grid Layout */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <Card rounded="2xl" variant="neutral" padding="none" className="text-center py-20 bg-neutral-900/80 border-neutral-800/40 shadow-sm">
            <p className="text-neutral-400 text-sm font-semibold uppercase tracking-wider">{t('partsTab.noCategories')}</p>
          </Card>
        ) : Object.keys(groupedInventory).length === 0 ? (
          <Card rounded="2xl" variant="neutral" padding="none" className="text-center py-20 bg-neutral-900/80 border-neutral-800/40 shadow-sm">
            <p className="text-neutral-400 text-sm font-semibold">{t('partsTab.noSearchHits', { search: searchTerm })}</p>
          </Card>
        ) : (
          categories.map(cat => {
            const items = groupedInventory[cat.id] || [];
            if (!groupedInventory[cat.id] && searchTerm) return null; // Hide if search filter excludes it

            const isExpanded = searchTerm ? true : (expandedCategories[cat.id] ?? false);
            const isAddingPartHere = addingPartCategoryId === cat.id;

            return (
              <Card 
                key={cat.id} 
                rounded="2xl"
                variant="neutral" 
                padding="none" 
                className="bg-neutral-900/80 border-neutral-800/40 overflow-hidden transition-all duration-300 shadow-sm"
              >
                {/* Category Header */}
                <CategoryHeader
                  displayName={cat.displayName}
                  itemCount={items.length}
                  isExpanded={isExpanded}
                  isAddingPart={isAddingPartHere}
                  onToggle={() => toggleCategory(cat.id)}
                  onToggleAddPart={() => setAddingPartCategoryId(isAddingPartHere ? null : cat.id)}
                  onDelete={(e) => handleDeleteCategory(e, cat.id)}
                />

                {/* Add Part Form inline under the selected category */}
                {isAddingPartHere && (
                  <div className="mx-6 mb-6">
                    <PartFormInline
                      title={t('partsTab.addPartTitle', { catName: cat.displayName })}
                      submitLabel={t('partsTab.addPartSubmit')}
                      oemRef={newOemRef}
                      setOemRef={setNewOemRef}
                      name={newName}
                      setName={setNewName}
                      manufacturer={newManufacturer}
                      setManufacturer={setNewManufacturer}
                      specs={newSpecs}
                      setSpecs={setNewSpecs}
                      stockQty={newStockQty}
                      setStockQty={setNewStockQty}
                      avisoThreshold={newAvisoThreshold}
                      setAvisoThreshold={setNewAvisoThreshold}
                      costPrice={newCostPrice}
                      setCostPrice={setNewCostPrice}
                      retailPrice={newRetailPrice}
                      setRetailPrice={setNewRetailPrice}
                      onSubmit={handleCreatePart}
                      onCancel={() => setAddingPartCategoryId(null)}
                      submitting={addingPart}
                    />
                  </div>
                )}

                {/* Items Listing */}
                {isExpanded && (
                  <div className="px-6 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    {items.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic py-2 text-center">{t('partsTab.noPartsInCat')}</p>
                    ) : (
                      items.map(item => {
                        const isEditingThis = editingItem?.id === item.id;

                        if (isEditingThis) {
                          return (
                            <PartFormInline
                              key={item.id}
                              title={t('partsTab.modifyPartTitle', { name: item.part.name })}
                              submitLabel={t('common.saveChanges')}
                              oemRef={editOemRef}
                              setOemRef={setEditOemRef}
                              name={editName}
                              setName={setEditName}
                              manufacturer={editManufacturer}
                              setManufacturer={setEditManufacturer}
                              specs={editSpecs}
                              setSpecs={setEditSpecs}
                              stockQty={editStockQty}
                              setStockQty={setEditStockQty}
                              avisoThreshold={editAvisoThreshold}
                              setAvisoThreshold={setEditAvisoThreshold}
                              costPrice={editCostPrice}
                              setCostPrice={setEditCostPrice}
                              retailPrice={editRetailPrice}
                              setRetailPrice={setEditRetailPrice}
                              onSubmit={handleSaveEdit}
                              onCancel={() => setEditingItem(null)}
                              submitting={savingEdit}
                            />
                          );
                        }

                        return (
                          <PartItemRow
                            key={item.id}
                            item={item}
                            onStartEdit={() => handleStartEdit(item)}
                            onDelete={() => handleDeletePart(item.id)}
                          />
                        );
                      })
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
      {confirmModal && (
        <ConfirmCardModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(null)}
          onConfirm={handleConfirmAction}
          title={confirmModal.title}
          description={confirmModal.description}
          confirmText={confirmModal.confirmText}
          theme={confirmModal.theme}
        />
      )}
    </div>
  );
};
