import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../../../config/api';

interface CatalogTask {
  id: string;
  code: string;
  name: string;
  hours?: number;
  hours4Cil?: number;
  hoursCilExtra?: number | null;
  hours1Rueda?: number;
}

interface CatalogCategory {
  id: string;
  name: string;
  displayName: string;
  tasks: CatalogTask[];
}

interface TasksTabProps {
  workshopId: string;
}

export const TasksTab: React.FC<TasksTabProps> = ({ workshopId }) => {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Expanded categories state
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Search filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered categories based on search term
  const filteredCategories = categories.map(cat => {
    const catMatches = cat.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchedTasks = cat.tasks.filter(task => 
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (catMatches || matchedTasks.length > 0) {
      return {
        ...cat,
        tasks: catMatches && matchedTasks.length === 0 ? cat.tasks : matchedTasks
      };
    }
    return null;
  }).filter((cat): cat is CatalogCategory => cat !== null);

  // Adding Category Form State
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);

  // Adding Task Form State (tied to category ID)
  const [addingTaskCatId, setAddingTaskCatId] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCalcType, setNewTaskCalcType] = useState<'fixed' | 'cylinder' | 'wheel'>('fixed');
  const [newHours, setNewHours] = useState('1.0');
  const [newHours4Cil, setNewHours4Cil] = useState('0.5');
  const [newHoursCilExtra, setNewHoursCilExtra] = useState('0.25');
  const [newHours1Rueda, setNewHours1Rueda] = useState('0.25');
  const [addingTask, setAddingTask] = useState(false);

  // Editing Task State
  const [editingTask, setEditingTask] = useState<CatalogTask | null>(null);
  const [editingTaskName, setEditingTaskName] = useState('');
  const [editingCalcType, setEditingCalcType] = useState<'fixed' | 'cylinder' | 'wheel'>('fixed');
  const [editingHours, setEditingHours] = useState('');
  const [editingHours4Cil, setEditingHours4Cil] = useState('');
  const [editingHoursCilExtra, setEditingHoursCilExtra] = useState('');
  const [editingHours1Rueda, setEditingHours1Rueda] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${API_BASE_URL}/catalog/workshop/${workshopId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar el catálogo');
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      console.error(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workshopId) {
      fetchCatalog();
    }
  }, [workshopId]);

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setAddingCat(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${API_BASE_URL}/catalog/workshop/${workshopId}/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ displayName: newCatName })
      });
      if (!res.ok) throw new Error('No se pudo añadir la categoría');
      
      setNewCatName('');
      setShowAddCat(false);
      await fetchCatalog();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAddingCat(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingTaskCatId || !newTaskName.trim()) return;

    setAddingTask(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const body: any = {
        name: newTaskName
      };

      if (newTaskCalcType === 'fixed') {
        body.hours = parseFloat(newHours) || 0;
      } else if (newTaskCalcType === 'cylinder') {
        body.hours4Cil = parseFloat(newHours4Cil) || 0;
        body.hoursCilExtra = newHoursCilExtra ? parseFloat(newHoursCilExtra) : null;
      } else {
        body.hours1Rueda = parseFloat(newHours1Rueda) || 0;
      }

      const res = await fetch(`${API_BASE_URL}/catalog/workshop/${workshopId}/categories/${addingTaskCatId}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('No se pudo crear la tarea');

      setNewTaskName('');
      setAddingTaskCatId(null);
      await fetchCatalog();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAddingTask(false);
    }
  };

  const handleStartEdit = (task: CatalogTask) => {
    setEditingTask(task);
    setEditingTaskName(task.name);
    if (task.hours !== undefined && task.hours !== null) {
      setEditingCalcType('fixed');
      setEditingHours(task.hours.toString());
    } else if (task.hours4Cil !== undefined && task.hours4Cil !== null) {
      setEditingCalcType('cylinder');
      setEditingHours4Cil(task.hours4Cil.toString());
      setEditingHoursCilExtra(task.hoursCilExtra ? task.hoursCilExtra.toString() : '');
    } else {
      setEditingCalcType('wheel');
      setEditingHours1Rueda(task.hours1Rueda ? task.hours1Rueda.toString() : '0.25');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTaskName.trim()) return;

    setSavingEdit(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const body: any = {
        name: editingTaskName,
        hours: null,
        hours4Cil: null,
        hoursCilExtra: null,
        hours1Rueda: null
      };

      if (editingCalcType === 'fixed') {
        body.hours = parseFloat(editingHours) || 0;
      } else if (editingCalcType === 'cylinder') {
        body.hours4Cil = parseFloat(editingHours4Cil) || 0;
        body.hoursCilExtra = editingHoursCilExtra ? parseFloat(editingHoursCilExtra) : null;
      } else {
        body.hours1Rueda = parseFloat(editingHours1Rueda) || 0;
      }

      const res = await fetch(`${API_BASE_URL}/catalog/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('No se pudo guardar la tarea');

      setEditingTask(null);
      await fetchCatalog();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta tarea del catálogo de tu taller? Los citas pasadas no se verán afectadas.')) return;

    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${API_BASE_URL}/catalog/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('No se pudo eliminar la tarea');
      await fetchCatalog();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-500 gap-4">
        <div className="w-12 h-12 border-2 border-neutral-800 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest font-black">Cargando catálogo del taller...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Title block */}
      <div className="flex justify-between items-center bg-neutral-900/40 border border-neutral-800/80 rounded-3xl p-6 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Catálogo de Servicios</h2>
          <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">Controla y personaliza las tareas mecánicas de tu taller</p>
        </div>
        <button
          onClick={() => setShowAddCat(!showAddCat)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-xs font-black uppercase tracking-wider hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95 flex items-center gap-2"
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
          placeholder="Buscar servicios por descripción o código (ej: alternador, 1.10, frenos)..."
          className="w-full bg-neutral-900/40 border border-neutral-800/80 rounded-2xl pl-12 pr-12 py-3.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-all placeholder-neutral-500 backdrop-blur-md"
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
      {showAddCat && (
        <form onSubmit={handleCreateCategory} className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Nombre de la Categoría</label>
            <input
              type="text"
              required
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              placeholder="Ej: Aire Acondicionado, Transmisión, Suspensión..."
              className="bg-neutral-950/60 border border-neutral-800 rounded-2xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-all placeholder-neutral-700"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowAddCat(false)}
              className="px-4 py-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 text-xs font-bold uppercase tracking-wider text-neutral-400 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={addingCat}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-black uppercase tracking-wider text-white transition-all disabled:opacity-50"
            >
              {addingCat ? 'Creando...' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Categories */}
      <div className="space-y-3">
        {categories.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/10 border border-neutral-800/40 rounded-[2rem]">
            <p className="text-neutral-500 text-sm font-medium">No hay categorías configuradas para tu taller.</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/10 border border-neutral-800/40 rounded-[2rem]">
            <p className="text-neutral-500 text-sm font-medium">No se encontraron resultados para la búsqueda "{searchTerm}".</p>
          </div>
        ) : (
          filteredCategories.map(cat => {
            const isExpanded = searchTerm ? true : (expandedCategories[cat.id] ?? false);
            const isAddingTask = addingTaskCatId === cat.id;

            return (
              <div key={cat.id} className="bg-neutral-900/20 border border-neutral-800/60 rounded-[2rem] overflow-hidden transition-all">
                {/* Category Header */}
                <div
                  onClick={() => toggleCategory(cat.id)}
                  className="p-5 flex justify-between items-center cursor-pointer hover:bg-neutral-900/40 transition-all select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-neutral-800/50 border border-neutral-700/30 flex items-center justify-center">
                      <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white tracking-tight">{cat.displayName}</h3>
                      <span className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase block mt-0.5">
                        {cat.tasks.length} Tarea{cat.tasks.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddingTaskCatId(isAddingTask ? null : cat.id);
                        if (!isExpanded) toggleCategory(cat.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${
                        isAddingTask
                          ? 'border-red-500/30 bg-red-600/10 text-red-400'
                          : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/60 text-neutral-300'
                      }`}
                    >
                      {isAddingTask ? 'Cerrar' : '+ Tarea'}
                    </button>
                    <svg
                      className={`w-5 h-5 text-neutral-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Add Task Form Inline */}
                {isExpanded && isAddingTask && (
                  <form onSubmit={handleCreateTask} className="mx-6 mb-6 p-5 bg-neutral-950/40 border border-neutral-800/80 rounded-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Nueva tarea en {cat.displayName}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Nombre de la tarea</label>
                        <input
                          type="text"
                          required
                          value={newTaskName}
                          onChange={e => setNewTaskName(e.target.value)}
                          placeholder="Ej: Reparar radiador exterior, Carga de refrigerante..."
                          className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-white text-xs placeholder-neutral-700 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Tipo de Cálculo de Tiempo</label>
                        <select
                          value={newTaskCalcType}
                          onChange={e => setNewTaskCalcType(e.target.value as any)}
                          className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
                        >
                          <option value="fixed">Fijo (Tiempo determinado)</option>
                          <option value="cylinder">Por Cilindros (Coches/Motores)</option>
                          <option value="wheel">Por Ruedas (Neumáticos)</option>
                        </select>
                      </div>
                    </div>

                    {/* Conditional input fields based on CalcType */}
                    <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl">
                      {newTaskCalcType === 'fixed' && (
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Horas Estimadas Fijas</label>
                          <input
                            type="number"
                            step="0.05"
                            required
                            value={newHours}
                            onChange={e => setNewHours(e.target.value)}
                            className="bg-neutral-950/60 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs w-full max-w-[150px]"
                          />
                        </div>
                      )}
                      {newTaskCalcType === 'cylinder' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Horas Base (4 Cilindros)</label>
                            <input
                              type="number"
                              step="0.05"
                              required
                              value={newHours4Cil}
                              onChange={e => setNewHours4Cil(e.target.value)}
                              className="bg-neutral-950/60 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Horas Extra por Cilindro Adicional</label>
                            <input
                              type="number"
                              step="0.05"
                              value={newHoursCilExtra}
                              onChange={e => setNewHoursCilExtra(e.target.value)}
                              placeholder="Opcional"
                              className="bg-neutral-950/60 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs"
                            />
                          </div>
                        </div>
                      )}
                      {newTaskCalcType === 'wheel' && (
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Horas por Rueda</label>
                          <input
                            type="number"
                            step="0.05"
                            required
                            value={newHours1Rueda}
                            onChange={e => setNewHours1Rueda(e.target.value)}
                            className="bg-neutral-950/60 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs w-full max-w-[150px]"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setAddingTaskCatId(null)}
                        className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 text-xs font-bold uppercase tracking-wider"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={addingTask}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider disabled:opacity-50"
                      >
                        {addingTask ? 'Añadiendo...' : 'Añadir Tarea'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Task list container */}
                {isExpanded && (
                  <div className="px-6 pb-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    {cat.tasks.length === 0 ? (
                      <p className="text-center py-8 text-neutral-600 text-xs font-medium">Esta categoría no tiene tareas configuradas.</p>
                    ) : (
                      cat.tasks.map(task => {
                        const isEditingThis = editingTask?.id === task.id;

                        if (isEditingThis) {
                          return (
                            <form
                              key={task.id}
                              onSubmit={handleSaveEdit}
                              className="p-4 bg-neutral-950 border border-blue-500/40 rounded-2xl space-y-4 animate-in zoom-in-95 duration-200"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Nombre de la tarea</label>
                                  <input
                                    type="text"
                                    required
                                    value={editingTaskName}
                                    onChange={e => setEditingTaskName(e.target.value)}
                                    className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Tipo de Cálculo</label>
                                  <select
                                    value={editingCalcType}
                                    onChange={e => setEditingCalcType(e.target.value as any)}
                                    className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs"
                                  >
                                    <option value="fixed">Fijo (Tiempo determinado)</option>
                                    <option value="cylinder">Por Cilindros (Coches/Motores)</option>
                                    <option value="wheel">Por Ruedas (Neumáticos)</option>
                                  </select>
                                </div>
                              </div>

                              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                                {editingCalcType === 'fixed' && (
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Horas Estimadas Fijas</label>
                                    <input
                                      type="number"
                                      step="0.05"
                                      required
                                      value={editingHours}
                                      onChange={e => setEditingHours(e.target.value)}
                                      className="bg-neutral-950/60 border border-neutral-800 rounded-xl px-3 py-1.5 text-white text-xs w-full max-w-[120px]"
                                    />
                                  </div>
                                )}
                                {editingCalcType === 'cylinder' && (
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                      <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Horas Base (4 Cilindros)</label>
                                      <input
                                        type="number"
                                        step="0.05"
                                        required
                                        value={editingHours4Cil}
                                        onChange={e => setEditingHours4Cil(e.target.value)}
                                        className="bg-neutral-950/60 border border-neutral-800 rounded-xl px-3 py-1.5 text-white text-xs"
                                      />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Horas Extra por Cilindro Adicional</label>
                                      <input
                                        type="number"
                                        step="0.05"
                                        value={editingHoursCilExtra}
                                        onChange={e => setEditingHoursCilExtra(e.target.value)}
                                        className="bg-neutral-950/60 border border-neutral-800 rounded-xl px-3 py-1.5 text-white text-xs"
                                      />
                                    </div>
                                  </div>
                                )}
                                {editingCalcType === 'wheel' && (
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Horas por Rueda</label>
                                    <input
                                      type="number"
                                      step="0.05"
                                      required
                                      value={editingHours1Rueda}
                                      onChange={e => setEditingHours1Rueda(e.target.value)}
                                      className="bg-neutral-950/60 border border-neutral-800 rounded-xl px-3 py-1.5 text-white text-xs w-full max-w-[120px]"
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingTask(null)}
                                  className="px-3 py-1.5 rounded-lg border border-neutral-800 text-neutral-400 text-xs font-bold uppercase"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="submit"
                                  disabled={savingEdit}
                                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase"
                                >
                                  {savingEdit ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                              </div>
                            </form>
                          );
                        }

                        // Normal Task Row
                        return (
                          <div
                            key={task.id}
                            className="group px-4 py-3 bg-neutral-950/30 border border-neutral-850 hover:border-neutral-800 rounded-2xl flex items-center justify-between gap-4 transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-[10px] font-black text-neutral-600 font-mono tracking-widest uppercase shrink-0">
                                {task.code}
                              </span>
                              <p className="text-sm font-medium text-neutral-200 truncate">{task.name}</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {/* Hours Info Badge */}
                              <div className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-neutral-400">
                                {task.hours !== undefined && task.hours !== null && `${task.hours.toFixed(2)}h (fijas)`}
                                {task.hours4Cil !== undefined && task.hours4Cil !== null && `${task.hours4Cil.toFixed(2)}h (base) ${task.hoursCilExtra ? `+ ${task.hoursCilExtra.toFixed(2)}h/cil` : ''}`}
                                {task.hours1Rueda !== undefined && task.hours1Rueda !== null && `${task.hours1Rueda.toFixed(2)}h (por rueda)`}
                              </div>

                              {/* Edit Action */}
                              <button
                                onClick={() => handleStartEdit(task)}
                                className="p-2 text-neutral-500 hover:text-blue-400 hover:bg-neutral-800/40 rounded-xl transition-all"
                                title="Editar Tarea"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>

                              {/* Delete Action */}
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-2 text-neutral-600 hover:text-red-500 hover:bg-neutral-800/40 rounded-xl transition-all"
                                title="Eliminar Tarea"
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
