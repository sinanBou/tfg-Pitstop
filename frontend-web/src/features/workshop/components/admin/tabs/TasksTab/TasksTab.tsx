import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/api';
import { TabHeader } from '../shared/TabHeader';
import { AddCategoryForm } from '../shared/AddCategoryForm';
import { CategoryHeader } from '../shared/CategoryHeader';
import { TaskFormInline } from './components/TaskFormInline';
import { TaskItemRow } from './components/TaskItemRow';
import { Card } from '@/components/common/Card/Card';
import { useToast } from '@/hooks/useToast';
import { ConfirmCardModal } from '@/components/common/ConfirmCardModal';
import { Search, X, Box } from '@/assets/icons';
import { useTranslation } from '@/i18n';

export interface CatalogTask {
  id: string;
  code: string;
  name: string;
  hours?: number;
  hours4Cil?: number;
  hoursCilExtra?: number | null;
  hours1Rueda?: number;
}

export interface TaskCategory {
  id: string;
  name: string;
  displayName: string;
  tasks: CatalogTask[];
}

/**
 * Propiedades del componente TasksTab.
 */
interface TasksTabProps {
  /** Identificador único del taller para consultar y actualizar el catálogo de servicios. */
  workshopId: string;
}

/**
 * Pestaña de Catálogo de Servicios en el panel de Administración de Taller.
 * Permite gestionar todas las tareas mecánicas que el taller puede realizar (servicios).
 * Admite la creación de categorías/carpetas de tareas y la configuración de cálculos de horas
 * según tipos flexibles (horas fijas, tarifa progresiva por cilindros o por número de ruedas).
 */
export const TasksTab: React.FC<TasksTabProps> = ({ workshopId }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [categories, setCategories] = useState<TaskCategory[]>([]);
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
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'task' | 'category' | null;
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

    if (type === 'task') {
      try {
        const token = localStorage.getItem('jwt_token');
        const res = await fetch(`${API_BASE_URL}/catalog/tasks/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('No se pudo eliminar la tarea');
        toast.success('Tarea eliminada con éxito del catálogo.');
        await fetchCatalog();
      } catch (err: any) {
        toast.error(err.message);
      }
    } else if (type === 'category') {
      try {
        const token = localStorage.getItem('jwt_token');
        const res = await fetch(`${API_BASE_URL}/catalog/categories/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('No se pudo eliminar la categoría (comprueba que no contenga tareas)');
        toast.success('Categoría de tareas eliminada con éxito.');
        await fetchCatalog();
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

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
      toast.error(err.message);
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
      toast.error(err.message);
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
      toast.error(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete task
  const handleDeleteTask = (id: string) => {
    setConfirmModal({
      isOpen: true,
      type: 'task',
      id,
      title: t('tasksTab.deleteTaskTitle'),
      description: t('tasksTab.deleteTaskDesc'),
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

  // Filtered categories based on search term
  const filteredCategories = categories.map(cat => {
    const matchedTasks = cat.tasks.filter(task =>
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const catMatches = cat.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (catMatches || matchedTasks.length > 0) {
      return {
        ...cat,
        tasks: matchedTasks
      };
    }
    return null;
  }).filter(Boolean) as TaskCategory[];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-neutral-500 gap-4">
        <div className="w-12 h-12 border-2 border-slate-300 dark:border-neutral-800 border-t-red-600 rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest font-black">{t('tasksTab.loadingCatalog')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-900 dark:text-white animate-fade-in-up select-none">
      {/* Title block */}
      <TabHeader
        title={t('tasksTab.title')}
        subtitle={t('tasksTab.subtitle')}
        actionLabel={t('partsTab.newCategoryBtn')}
        onActionClick={() => setShowAddCat(!showAddCat)}
        colorVariant="red"
      />

      {/* Search Input Bar */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search className="w-5 h-5 text-slate-400 dark:text-neutral-500" />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={t('tasksTab.searchPlaceholder')}
          className="w-full bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-2xl pl-12 pr-12 py-3.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-red-500/50 focus:bg-slate-100/50 dark:focus:bg-black/40 transition-all placeholder-slate-400 dark:placeholder-neutral-500 font-semibold shadow-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-700 dark:text-neutral-500 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Add Category Form Panel */}
      {showAddCat && (
        <AddCategoryForm
          title={t('tasksTab.createCategoryTitle')}
          label={t('partsTab.categoryNameLabel')}
          placeholder={t('tasksTab.categoryNamePlaceholder')}
          value={newCatName}
          onChange={setNewCatName}
          onSubmit={handleCreateCategory}
          onCancel={() => setShowAddCat(false)}
          submitting={addingCat}
          colorVariant="red"
        />
      )}

      {/* Main Grid: Categories */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <Card rounded="2xl" variant="neutral" padding="none" className="text-center py-20 bg-white/80 dark:bg-neutral-900/80 border-slate-200 dark:border-neutral-800/40 shadow-sm">
            <p className="text-slate-600 dark:text-neutral-400 text-sm font-semibold uppercase tracking-wider">{t('tasksTab.noCategories')}</p>
          </Card>
        ) : filteredCategories.length === 0 ? (
          <Card rounded="2xl" variant="neutral" padding="none" className="text-center py-20 bg-white/80 dark:bg-neutral-900/80 border-slate-200 dark:border-neutral-800/40 shadow-sm">
            <p className="text-slate-600 dark:text-neutral-400 text-sm font-semibold">{t('tasksTab.noSearchHits', { search: searchTerm })}</p>
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
                className="bg-white/80 dark:bg-neutral-900/80 border-slate-200 dark:border-neutral-800/40 overflow-hidden transition-all duration-300 shadow-sm"
              >
                {/* Category Header */}
                <CategoryHeader
                  displayName={cat.displayName}
                  itemCount={cat.tasks.length}
                  isExpanded={isExpanded}
                  isAddingPart={isAddingTaskHere}
                  onToggle={() => toggleCategory(cat.id)}
                  onToggleAddPart={() => setAddingTaskCatId(isAddingTaskHere ? null : cat.id)}
                  onDelete={(e) => handleDeleteCategory(e, cat.id)}
                  addLabel={t('tasksTab.addTaskSubmit')}
                  itemLabelSingle={t('workshopDashboard.tasksTab')}
                  itemLabelPlural={t('workshopDashboard.tasksTab')}
                  gender="f"
                  icon={Box}
                  colorVariant="red"
                />

                {/* Add Task Form Inline */}
                {isAddingTaskHere && (
                  <div className="mx-6 mb-6">
                    <TaskFormInline
                      title={t('tasksTab.addTaskTitle', { catName: cat.displayName })}
                      submitLabel={t('tasksTab.addTaskSubmit')}
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
                      <p className="text-xs text-slate-500 dark:text-neutral-500 italic py-2 text-center">{t('tasksTab.noTasksInCat')}</p>
                    ) : (
                      cat.tasks.map(task => {
                        const isEditingThis = editingTask?.id === task.id;

                        if (isEditingThis) {
                          return (
                            <TaskFormInline
                              key={task.id}
                              title={t('tasksTab.modifyTaskTitle', { name: task.name })}
                              submitLabel={t('common.saveChanges')}
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
