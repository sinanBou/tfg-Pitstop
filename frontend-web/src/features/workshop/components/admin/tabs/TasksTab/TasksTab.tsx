import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/api';
import { TabHeader } from '../shared/TabHeader';
import { AddCategoryForm } from '../shared/AddCategoryForm';
import { CategoryHeader } from '../PartsTab/components/CategoryHeader';
import { TaskFormInline } from './components/TaskFormInline';
import { TaskItemRow } from './components/TaskItemRow';
import { Card } from '@/components/common/Card/Card';

export interface CatalogTask {
  id: string;
  code: string;
  name: string;
  hours?: number;
  hours4Cil?: number;
  hoursCilExtra?: number | null;
  hours1Rueda?: number;
}

export interface CatalogCategory {
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

  // Search and expand states
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

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
      setCategories(data || []);
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

  // Create Category
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

  // Create Task
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

  // Start edit
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

  // Save edit
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

  // Delete task
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-500 gap-4">
        <div className="w-12 h-12 border-2 border-neutral-800 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest font-black">Cargando catálogo del taller...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white animate-fade-in-up select-none">
      {/* Title block */}
      <TabHeader
        title="Catálogo de Servicios"
        subtitle="Controla y personaliza las tareas mecánicas de tu taller"
        actionLabel="Nueva Categoría"
        onActionClick={() => setShowAddCat(!showAddCat)}
        colorVariant="blue"
      />

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
          className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-12 pr-12 py-3.5 text-white text-xs focus:outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all placeholder-neutral-500 font-semibold"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-500 hover:text-white cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Add Category Form Panel */}
      {showAddCat && (
        <AddCategoryForm
          title="Crear Nueva Categoría de Servicios"
          label="Nombre de la Categoría"
          placeholder="Ej: Aire Acondicionado, Transmisión, Suspensión..."
          value={newCatName}
          onChange={setNewCatName}
          onSubmit={handleCreateCategory}
          onCancel={() => setShowAddCat(false)}
          submitting={addingCat}
          colorVariant="blue"
        />
      )}

      {/* Main Grid: Categories */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <Card rounded="2xl" variant="neutral" padding="none" className="text-center py-20 bg-neutral-900/80 border-neutral-800/40 shadow-sm">
            <p className="text-neutral-400 text-sm font-semibold uppercase tracking-wider">No hay categorías configuradas para tu taller.</p>
          </Card>
        ) : filteredCategories.length === 0 ? (
          <Card rounded="2xl" variant="neutral" padding="none" className="text-center py-20 bg-neutral-900/80 border-neutral-800/40 shadow-sm">
            <p className="text-neutral-400 text-sm font-semibold">No se encontraron resultados para la búsqueda "{searchTerm}".</p>
          </Card>
        ) : (
          filteredCategories.map(cat => {
            const isExpanded = searchTerm ? true : (expandedCategories[cat.id] ?? false);
            const isAddingTaskHere = addingTaskCatId === cat.id;

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
                  itemCount={cat.tasks.length}
                  isExpanded={isExpanded}
                  isAddingPart={isAddingTaskHere}
                  onToggle={() => toggleCategory(cat.id)}
                  onToggleAddPart={() => setAddingTaskCatId(isAddingTaskHere ? null : cat.id)}
                />

                {/* Add Task Form Inline */}
                {isAddingTaskHere && (
                  <div className="mx-6 mb-6">
                    <TaskFormInline
                      title={`Nueva tarea en ${cat.displayName}`}
                      submitLabel="Añadir Tarea"
                      name={newTaskName}
                      setName={setNewTaskName}
                      calcType={newTaskCalcType}
                      setCalcType={setNewTaskCalcType}
                      hours={newHours}
                      setHours={setNewHours}
                      hours4Cil={newHours4Cil}
                      setHours4Cil={setNewHours4Cil}
                      hoursCilExtra={newHoursCilExtra}
                      setHoursCilExtra={setNewHoursCilExtra}
                      hours1Rueda={newHours1Rueda}
                      setHours1Rueda={setNewHours1Rueda}
                      onSubmit={handleCreateTask}
                      onCancel={() => setAddingTaskCatId(null)}
                      submitting={addingTask}
                    />
                  </div>
                )}

                {/* Task list container */}
                {isExpanded && (
                  <div className="px-6 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    {cat.tasks.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic py-2 text-center">Esta categoría no tiene tareas configuradas.</p>
                    ) : (
                      cat.tasks.map(task => {
                        const isEditingThis = editingTask?.id === task.id;

                        if (isEditingThis) {
                          return (
                            <TaskFormInline
                              key={task.id}
                              title={`Modificar tarea ${task.name}`}
                              submitLabel="Guardar Cambios"
                              name={editingTaskName}
                              setName={setEditingTaskName}
                              calcType={editingCalcType}
                              setCalcType={setEditingCalcType}
                              hours={editingHours}
                              setHours={setEditingHours}
                              hours4Cil={editingHours4Cil}
                              setHours4Cil={setEditingHours4Cil}
                              hoursCilExtra={editingHoursCilExtra}
                              setHoursCilExtra={setEditingHoursCilExtra}
                              hours1Rueda={editingHours1Rueda}
                              setHours1Rueda={setEditingHours1Rueda}
                              onSubmit={handleSaveEdit}
                              onCancel={() => setEditingTask(null)}
                              submitting={savingEdit}
                            />
                          );
                        }

                        return (
                          <TaskItemRow
                            key={task.id}
                            task={task}
                            onStartEdit={() => handleStartEdit(task)}
                            onDelete={() => handleDeleteTask(task.id)}
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
    </div>
  );
};
