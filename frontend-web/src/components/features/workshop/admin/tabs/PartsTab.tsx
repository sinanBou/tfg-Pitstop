import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../../../../../config/api';
import type { WorkshopInventory, PartCategory } from '../../../../../types/client';

interface PartsTabProps {
  workshopId: string;
}

export const PartsTab: React.FC<PartsTabProps> = ({ workshopId }) => {
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      
      const [catsRes, invRes] = await Promise.all([
        fetch(`${API_BASE_URL}/parts/categories`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/parts/inventory`, {
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
      const res = await fetch(`${API_BASE_URL}/parts/categories`, {
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
      alert(err.message);
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

      const res = await fetch(`${API_BASE_URL}/parts/inventory`, {
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
      alert(err.message);
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
      alert(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete inventory handler
  const handleDeletePart = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este repuesto del almacén? Se desvinculará de cualquier orden histórica.')) return;

    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${API_BASE_URL}/parts/inventory/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('No se pudo eliminar el repuesto');
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete Category Handler
  const handleDeleteCategory = async (e: React.MouseEvent, categoryId: string) => {
    e.stopPropagation();
    if (!window.confirm('¿Seguro que deseas eliminar esta categoría? Debe estar vacía.')) return;

    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${API_BASE_URL}/parts/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('No se pudo eliminar la categoría (comprueba que no contenga repuestos)');
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-500 gap-4">
        <div className="w-12 h-12 border-2 border-neutral-800 border-t-red-600 rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest font-black">Cargando inventario de almacén...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white animate-fade-in-up">
      {/* Title Block */}
      <div className="flex justify-between items-center bg-neutral-900/40 border border-neutral-800/80 rounded-3xl p-6 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Inventario de Almacén</h2>
          <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">Administra las categorías de repuestos y las existencias físicas</p>
        </div>
        <button
          onClick={() => setShowAddCategory(!showAddCategory)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-xs font-black uppercase tracking-wider hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all active:scale-95 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Categoría
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar repuestos por descripción, OEM, marca o categoría (ej: Brembo, REF-1020, Pastillas)..."
          className="w-full bg-neutral-900/40 border border-neutral-800/80 rounded-2xl pl-12 pr-12 py-3.5 text-white text-sm focus:outline-none focus:border-red-500 transition-all placeholder-neutral-500 backdrop-blur-md font-medium"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-500 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Add Category Form Panel */}
      {showAddCategory && (
        <form onSubmit={handleCreateCategory} className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Crear Nueva Categoría de Repuestos</p>
          <div className="flex gap-4 items-end">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Nombre de la Categoría</label>
              <input
                type="text"
                required
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="Ej: Transmisión, Suspensión, Embragues..."
                className="bg-neutral-950/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-red-500 transition-all font-semibold"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddCategory(false)}
                className="px-4 py-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 text-xs font-bold uppercase tracking-wider text-neutral-400 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={addingCategory}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-black uppercase tracking-wider text-white transition-all disabled:opacity-50"
              >
                {addingCategory ? 'Creando...' : 'Crear Categoría'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Categories Grid Layout */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/10 border border-neutral-800/40 rounded-[2rem]">
            <p className="text-neutral-500 text-sm font-semibold uppercase tracking-wider">No hay categorías registradas en el almacén.</p>
          </div>
        ) : Object.keys(groupedInventory).length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/10 border border-neutral-800/40 rounded-[2rem]">
            <p className="text-neutral-500 text-sm font-semibold">No se encontraron categorías o repuestos con la búsqueda "{searchTerm}".</p>
          </div>
        ) : (
          categories.map(cat => {
            const items = groupedInventory[cat.id] || [];
            if (!groupedInventory[cat.id] && searchTerm) return null; // Hide if search filter excludes it

            const isExpanded = searchTerm ? true : (expandedCategories[cat.id] ?? false);
            const isAddingPartHere = addingPartCategoryId === cat.id;

            return (
              <div key={cat.id} className="bg-neutral-900/20 border border-neutral-800/60 rounded-[2rem] overflow-hidden transition-all duration-300">
                {/* Category Header */}
                <div
                  onClick={() => toggleCategory(cat.id)}
                  className="p-5 flex justify-between items-center cursor-pointer hover:bg-neutral-900/40 transition-all select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-neutral-800/50 border border-neutral-700/30 flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white tracking-tight uppercase text-sm tracking-wider">{cat.displayName}</h3>
                      <span className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase block mt-0.5">
                        {items.length} Repuesto{items.length !== 1 ? 's' : ''} registrado{items.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setAddingPartCategoryId(isAddingPartHere ? null : cat.id)}
                      className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Añadir Repuesto
                    </button>
                    {items.length === 0 && (
                      <button
                        onClick={(e) => handleDeleteCategory(e, cat.id)}
                        className="p-2 text-neutral-600 hover:text-red-500 hover:bg-neutral-800/40 rounded-xl transition-all"
                        title="Eliminar Categoría Vacía"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                    <svg
                      onClick={() => toggleCategory(cat.id)}
                      className={`w-5 h-5 text-neutral-500 cursor-pointer transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Add Part Form inline under the selected category */}
                {isAddingPartHere && (
                  <form onSubmit={handleCreatePart} className="mx-6 mb-6 p-5 bg-neutral-950 border border-red-500/20 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                      Añadir Repuesto a {cat.displayName}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Referencia OEM</label>
                        <input
                          type="text"
                          value={newOemRef}
                          onChange={e => setNewOemRef(e.target.value)}
                          placeholder="Ej: REF-1020 (Opcional)..."
                          className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-red-500 transition-all font-semibold"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Nombre del Repuesto</label>
                        <input
                          type="text"
                          required
                          value={newName}
                          onChange={e => setNewName(e.target.value)}
                          placeholder="Ej: Disco de freno delantero"
                          className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-red-500 transition-all font-semibold"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Fabricante</label>
                        <input
                          type="text"
                          value={newManufacturer}
                          onChange={e => setNewManufacturer(e.target.value)}
                          placeholder="Ej: Brembo, Bosch..."
                          className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-red-500 transition-all font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Especificaciones Técnicas</label>
                        <input
                          type="text"
                          value={newSpecs}
                          onChange={e => setNewSpecs(e.target.value)}
                          placeholder="Ej: Diámetro 280mm, ventilado..."
                          className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-red-500 transition-all font-semibold"
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="flex flex-col gap-1.5 col-span-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Stock Inicial</label>
                          <input
                            type="number"
                            required
                            value={newStockQty}
                            onChange={e => setNewStockQty(e.target.value)}
                            className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-red-500 transition-all font-semibold"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5 col-span-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Umbral Aviso</label>
                          <input
                            type="number"
                            required
                            value={newAvisoThreshold}
                            onChange={e => setNewAvisoThreshold(e.target.value)}
                            className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-red-500 transition-all font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Precio Coste (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={newCostPrice}
                          onChange={e => setNewCostPrice(e.target.value)}
                          placeholder="0.00"
                          className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-red-500 font-semibold"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Precio Venta (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={newRetailPrice}
                          onChange={e => setNewRetailPrice(e.target.value)}
                          placeholder="0.00"
                          className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-red-500 font-semibold"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setAddingPartCategoryId(null)}
                        className="px-4 py-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 text-xs font-bold uppercase tracking-wider text-neutral-400 transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={addingPart}
                        className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-black uppercase tracking-wider text-white transition-all disabled:opacity-50"
                      >
                        {addingPart ? 'Añadiendo...' : 'Añadir al Almacén'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Items Listing */}
                {isExpanded && (
                  <div className="px-6 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    {items.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic py-2 text-center">No hay piezas añadidas en esta categoría.</p>
                    ) : (
                      items.map(item => {
                        const isEditingThis = editingItem?.id === item.id;
                        const isLowStock = item.stockQuantity <= item.avisoThreshold;

                        if (isEditingThis) {
                          return (
                            <form
                              key={item.id}
                              onSubmit={handleSaveEdit}
                              className="p-5 bg-neutral-950 border border-red-500/40 rounded-2xl space-y-4 animate-in zoom-in-95 duration-200"
                            >
                              <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Modificar repuesto {item.part.name}</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">OEM Reference</label>
                                  <input
                                    type="text"
                                    value={editOemRef}
                                    onChange={e => setEditOemRef(e.target.value)}
                                    className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs font-semibold"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Nombre del repuesto</label>
                                  <input
                                    type="text"
                                    required
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs font-semibold"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Fabricante</label>
                                  <input
                                    type="text"
                                    value={editManufacturer}
                                    onChange={e => setEditManufacturer(e.target.value)}
                                    className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs font-semibold"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Especificaciones Técnicas</label>
                                  <input
                                    type="text"
                                    value={editSpecs}
                                    onChange={e => setEditSpecs(e.target.value)}
                                    className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs font-semibold"
                                  />
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                  <div className="flex flex-col gap-1 col-span-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Stock</label>
                                    <input
                                      type="number"
                                      required
                                      value={editStockQty}
                                      onChange={e => setEditStockQty(e.target.value)}
                                      className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs font-semibold"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1 col-span-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Aviso</label>
                                    <input
                                      type="number"
                                      required
                                      value={editAvisoThreshold}
                                      onChange={e => setEditAvisoThreshold(e.target.value)}
                                      className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs font-semibold"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Precio Coste (€)</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={editCostPrice}
                                    onChange={e => setEditCostPrice(e.target.value)}
                                    className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs font-semibold font-mono"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Precio Venta (€)</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={editRetailPrice}
                                    onChange={e => setEditRetailPrice(e.target.value)}
                                    className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs font-semibold font-mono"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 pt-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingItem(null)}
                                  className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 text-xs font-bold uppercase"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="submit"
                                  disabled={savingEdit}
                                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase disabled:opacity-50"
                                >
                                  {savingEdit ? 'Guardando...' : 'Guardar'}
                                </button>
                              </div>
                            </form>
                          );
                        }

                        return (
                          <div
                            key={item.id}
                            className={`group px-4 py-3 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                              isLowStock 
                                ? 'bg-amber-600/5 border-amber-500/20 hover:border-amber-500/30' 
                                : 'bg-neutral-950/30 border-neutral-850 hover:border-neutral-800'
                            }`}
                          >
                            <div className="flex items-start md:items-center gap-3 min-w-0 flex-1">
                              <span className="text-[10px] font-black text-neutral-500 font-mono tracking-widest uppercase shrink-0 px-2 py-1 bg-neutral-900 rounded-lg">
                                {item.part.oemReference}
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-neutral-200 truncate">{item.part.name}</p>
                                  <span className="text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-neutral-400 font-mono font-bold">
                                    {item.part.manufacturer}
                                  </span>
                                </div>
                                {item.part.technicalSpecs && (
                                  <p className="text-[10px] text-neutral-500 font-medium truncate mt-0.5">
                                    Specs: {item.part.technicalSpecs}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 shrink-0">
                              {/* Stock Indicator */}
                              <div className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1.5 ${
                                isLowStock
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                                  : 'bg-green-500/5 border-green-500/15 text-green-400'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isLowStock ? 'bg-amber-400' : 'bg-green-400'}`} />
                                Stock: {item.stockQuantity} uds.
                                {isLowStock && <span className="text-[8px] font-black uppercase text-amber-500/80">(Aviso ≤ {item.avisoThreshold})</span>}
                              </div>

                              {/* Prices details */}
                              <div className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-xl text-[10px] font-bold flex gap-3 text-neutral-400 font-mono">
                                <div><span className="text-[8px] text-neutral-600 font-sans uppercase">Coste:</span> {item.costPrice.toFixed(2)}€</div>
                                <div className="border-l border-neutral-800 pl-3">
                                  <span className="text-[8px] text-neutral-600 font-sans uppercase">Venta:</span> <span className="text-white font-bold">{item.retailPrice.toFixed(2)}€</span>
                                </div>
                              </div>

                              {/* Edit Action Button */}
                              <button
                                onClick={() => handleStartEdit(item)}
                                className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800/40 rounded-xl transition-all"
                                title="Modificar Repuesto"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>

                              {/* Delete Action Button */}
                              <button
                                onClick={() => handleDeletePart(item.id)}
                                className="p-2 text-neutral-600 hover:text-red-500 hover:bg-neutral-800/40 rounded-xl transition-all"
                                title="Eliminar Repuesto"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
