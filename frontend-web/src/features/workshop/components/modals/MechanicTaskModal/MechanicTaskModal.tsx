import React, { useState, useMemo, useEffect } from 'react';
import { X, Check, AlertTriangle, FileText, Calendar } from '@/assets/icons';
import { API_BASE_URL } from '@/config/api';
import { useTranslation } from '@/i18n';

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
/**
 * Representa una tarea genérica cargada desde el catálogo del taller.
 */
interface CatalogTask {
  /** Código único identificador de la tarea en el catálogo. */
  codigo: string;
  /** Nombre descriptivo del trabajo o servicio. */
  tarea: string;
  /** Tiempo base en horas estimado para un motor estándar de 4 cilindros. */
  horas_4_cil?: number;
  /** Incremento o decremento de horas por cada cilindro extra de desviación respecto a 4 cilindros. */
  horas_cil_extra?: number | null;
  /** Duración fija estándar en horas (para tareas de tiempo invariable). */
  horas?: number;
  /** Tiempo base en horas estimado por cada rueda individual en tareas de neumáticos. */
  horas_1_rueda?: number;
}

/**
 * Agrupación de tarea seleccionada junto a su identificador de categoría.
 */
interface SelectedTask {
  /** Objeto de tarea de catálogo. */
  task: CatalogTask;
  /** Categoría a la que pertenece la tarea. */
  category: string;
}

/**
 * Propiedades del componente MechanicTaskModal.
 */
interface MechanicTaskModalProps {
  /** Determina si la modal de planificación de tareas está abierta. */
  isOpen: boolean;
  /** Callback para cerrar la modal. */
  onClose: () => void;
  /** Objeto de la cita actual a la que se le definirán las tareas específicas. */
  appointment: any;
  /** Callback ejecutado tras guardar con éxito las tareas y tiempos de mano de obra en el servidor. */
  onSuccess: () => void;
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Comprueba si una tarea escala su duración en función del número de ruedas a sustituir.
 * 
 * @param task Tarea a verificar.
 * @returns true si tiene definido el campo horas_1_rueda.
 */
function isWheelTask(task: CatalogTask): boolean {
  return task.horas_1_rueda !== undefined;
}

/**
 * Comprueba si una tarea escala su duración en función del número de cilindros del motor.
 * 
 * @param task Tarea a verificar.
 * @returns true si tiene definido el campo horas_4_cil.
 */
function isCylinderTask(task: CatalogTask): boolean {
  return task.horas_4_cil !== undefined;
}

/**
 * Calcula dinámicamente las horas totales estimadas para una tarea mecánica,
 * considerando parámetros de configuración del motor (cilindros) o del tren de rodaje (ruedas).
 * 
 * @param task Tarea de catálogo.
 * @param cylinders Número de cilindros del motor.
 * @param wheels Número de ruedas a sustituir.
 * @returns Tiempo calculado en horas para la mano de obra.
 */
function calcHoursForTask(task: CatalogTask, cylinders: number, wheels: number = 0): number {
  // Wheel-based tasks
  if (task.horas_1_rueda !== undefined) {
    return task.horas_1_rueda * wheels;
  }
  
  // Fixed hour tasks
  if (task.horas !== undefined) {
    return task.horas;
  }
  
  // Cylinder-based tasks (motores)
  if (task.horas_4_cil !== undefined) {
    if (cylinders === 0) return 0;
    const base = task.horas_4_cil;
    const extra = task.horas_cil_extra;
    
    // Only scale if the JSON explicitly provides an extra-per-cylinder value
    if (extra !== null && extra !== undefined) {
      // Linear scaling for ALL cylinders (1, 2, 3, 4, 5...)
      // base is the value for 4 cylinders
      return Math.max(0, base + extra * (cylinders - 4));
    }
    
    // If extra is null/undefined, it's a fixed service time
    return base;
  }
  
  return 0;
}

/**
 * Modal para la asignación y planificación de tareas del catálogo de servicios del taller.
 * Permite buscar servicios del catálogo, modularizar su duración según el número de cilindros o ruedas,
 * calcular estimaciones de tiempos de mano de obra en tiempo real y persistir el presupuesto temporal
 * de la cita/tarea en el servidor.
 */
export const MechanicTaskModal: React.FC<MechanicTaskModalProps> = ({
  isOpen, onClose, appointment, onSuccess,
}) => {
  const { t } = useTranslation();
  const [cylinders, setCylinders] = useState<number>(0);
  const [wheels, setWheels] = useState<number>(0);
  const [selectedTasks, setSelectedTasks] = useState<SelectedTask[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('1_consumibles');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [catalogSections, setCatalogSections] = useState<{ key: string; label: string; tasks: CatalogTask[] }[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  const sections = catalogSections;

  // Fetch dynamic catalog for this specific workshop
  useEffect(() => {
    if (!isOpen || !appointment?.workshopId) return;

    setLoadingCatalog(true);
    const token = localStorage.getItem('jwt_token');
    fetch(`${API_BASE_URL}/catalog/workshop/${appointment.workshopId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then((data: any[]) => {
        const mapped = data.map(cat => ({
          key: cat.name,
          label: cat.displayName,
          tasks: (cat.tasks || []).map((t: any) => ({
            codigo: t.code,
            tarea: t.name,
            horas: t.hours ?? undefined,
            horas_4_cil: t.hours4Cil ?? undefined,
            horas_cil_extra: t.hoursCilExtra ?? undefined,
            horas_1_rueda: t.hours1Rueda ?? undefined
          }))
        }));
        setCatalogSections(mapped);
        if (mapped.length > 0) {
          if (!mapped.some(s => s.key === activeCategory)) {
            setActiveCategory(mapped[0].key);
          }
        }
      })
      .catch(err => console.error("Error loading task catalog:", err))
      .finally(() => setLoadingCatalog(false));
  }, [isOpen, appointment?.workshopId]);

  // Pre-populate previously managed tasks and parameters
  useEffect(() => {
    if (isOpen && appointment && !loadingCatalog && sections.length > 0) {
      if (appointment.serviceType) {
        const savedCodes = appointment.serviceType
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean);

        const loadedTasks: SelectedTask[] = [];
        savedCodes.forEach((code: string) => {
          for (const section of sections) {
            const matchedTask = section.tasks.find(t => t.codigo === code);
            if (matchedTask) {
              loadedTasks.push({
                task: matchedTask,
                category: section.key
              });
              break;
            }
          }
        });
        setSelectedTasks(loadedTasks);
      } else {
        setSelectedTasks([]);
      }

      if (appointment.mechanicComments) {
        // e.g. "Cilindros: 4 | Ruedas: 2"
        const cylindersMatch = appointment.mechanicComments.match(/Cilindros:\s*(\d+)/i);
        if (cylindersMatch) {
          setCylinders(parseInt(cylindersMatch[1], 10));
        } else {
          setCylinders(0);
        }

        const wheelsMatch = appointment.mechanicComments.match(/Ruedas:\s*(\d+)/i);
        if (wheelsMatch) {
          setWheels(parseInt(wheelsMatch[1], 10));
        } else {
          setWheels(0);
        }
      } else {
        setCylinders(0);
        setWheels(0);
      }
    }
  }, [isOpen, appointment, loadingCatalog, sections]);

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) {
      // No query → show tasks of active category only
      const section = sections.find(s => s.key === activeCategory);
      return section ? section.tasks.map(t => ({ ...t, _sectionLabel: section.label })) : [];
    }
    // Global search across ALL sections
    const q = searchQuery.toLowerCase();
    return sections.flatMap(s =>
      s.tasks
        .filter(t => t.tarea.toLowerCase().includes(q) || t.codigo.toLowerCase().includes(q))
        .map(t => ({ ...t, _sectionLabel: s.label }))
    );
  }, [activeCategory, sections, searchQuery]);

  const totalHours = useMemo(() =>
    selectedTasks.reduce((sum, { task }) => sum + calcHoursForTask(task, cylinders, wheels), 0),
  [selectedTasks, cylinders, wheels]);

  const totalMinutes = Math.round(totalHours * 60);

  const isSelected = (codigo: string) =>
    selectedTasks.some(s => s.task.codigo === codigo);

  /** Show cylinder counter only when a selected task needs cylinders */
  const showCylinderCounter = selectedTasks.some(s => isCylinderTask(s.task));

  /** Show wheel counter only when a selected task needs wheels */
  const showWheelCounter = selectedTasks.some(s => isWheelTask(s.task));

  const toggleTask = (task: CatalogTask) => {
    if (isSelected(task.codigo)) {
      setSelectedTasks(prev => prev.filter(s => s.task.codigo !== task.codigo));
    } else {
      setSelectedTasks(prev => [...prev, { task, category: activeCategory }]);
    }
  };

  const handleSubmit = async () => {
    if (selectedTasks.length === 0) {
      setError('Selecciona al menos una tarea.');
      return;
    }
    // Validate cylinder input
    if (showCylinderCounter && cylinders === 0) {
      setError('Indica el número de cilindros del vehículo.');
      return;
    }
    // Validate wheel input
    if (showWheelCounter && wheels === 0) {
      setError('Indica el número de ruedas a sustituir.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const serviceLabel = selectedTasks.map(s => s.task.codigo).join(', ');
      const comments = `Cilindros: ${cylinders}${selectedTasks.some(s => isWheelTask(s.task)) ? ` | Ruedas: ${wheels}` : ''}`;
      const targetAppointmentId = appointment.originAppointmentId || appointment.id;
      const res = await fetch(`${API_BASE_URL}/appointments/${targetAppointmentId}/manage`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceType: serviceLabel,
          calculatedMinutes: totalMinutes,
          mechanicComments: comments,
          status: 'PENDING',
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || t('common.error'));
      }
      onSuccess();
      onClose();
      setSelectedTasks([]);
      setCylinders(0);
      setWheels(0);
    } catch (err: any) {
      setError(err.message ?? t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-neutral-800 rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.9)] flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-300">

        {/* Progress line */}
        <div className="h-1 w-full bg-neutral-900 shrink-0">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
            style={{ width: selectedTasks.length > 0 ? `${Math.min(100, (totalHours / 16) * 100)}%` : '0%' }}
          />
        </div>

        {/* Header */}
        <div className="p-8 pb-5 border-b border-neutral-800/50 bg-neutral-950/20 flex justify-between items-start shrink-0">
          <div>
            <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-1">{t('mechanicTaskModal.title')}</p>
            <h2 className="text-2xl font-black uppercase tracking-[0.08em] text-white">
              {appointment?.vehicleDisplay}
            </h2>
            <p className="text-neutral-400 text-xs mt-1">{appointment?.clientFullName}</p>
          </div>
          <button onClick={onClose} className="p-3 text-neutral-500 hover:text-white hover:bg-neutral-800/50 rounded-2xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body — two columns */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left: Category list + task selector */}
          <div className="flex flex-col w-[65%] border-r border-neutral-800/60 overflow-hidden">

            {/* Search bar only */}
            <div className="p-5 border-b border-neutral-800/40 shrink-0">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-1">{t('mechanicTaskModal.searchTaskLabel')}</label>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('mechanicTaskModal.searchTaskPlaceholder')}
                className="w-full bg-neutral-800/60 border border-neutral-700 rounded-xl px-4 py-2 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-blue-500/60"
              />
            </div>

            {/* Category tabs — dimmed during global search */}
            <div className="flex overflow-x-auto gap-1 px-4 py-3 shrink-0 border-b border-neutral-800/40 custom-scrollbar">
              {searchQuery.trim() && (
                <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0">
                  {t('mechanicTaskModal.globalSearch')}
                </span>
              )}
              {sections.map(s => (
                <button
                  key={s.key}
                  onClick={() => { setActiveCategory(s.key); setSearchQuery(''); }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                    searchQuery.trim()
                      ? 'bg-neutral-800/30 text-neutral-600 hover:text-neutral-400'
                      : activeCategory === s.key
                        ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                        : 'bg-neutral-800/60 text-neutral-400 hover:text-white hover:bg-neutral-700/60'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Task list */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
              {loadingCatalog ? (
                <div className="text-center py-20 text-neutral-500 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-neutral-800 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-xs uppercase tracking-widest font-black">{t('mechanicTaskModal.loadingCatalog')}</p>
                </div>
              ) : (
                <>
                  {searchQuery.trim() && (
                    <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest pb-1">
                      {t(filteredTasks.length === 1 ? 'mechanicTaskModal.resultsCount' : 'mechanicTaskModal.resultsCount_plural', { count: filteredTasks.length })}
                    </p>
                  )}
                  {filteredTasks.length === 0 && (
                    <p className="text-neutral-600 text-center py-12 text-sm">{t('mechanicTaskModal.noTasksFound')}</p>
                  )}
                  {(filteredTasks as any[]).map((task: any) => {
                    const hours = calcHoursForTask(task, cylinders, wheels);
                    const selected = isSelected(task.codigo);
                    const wheelBased = isWheelTask(task);
                    return (
                      <button
                        key={task.codigo}
                        onClick={() => toggleTask(task)}
                        className={`w-full text-left px-4 py-3 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                          selected
                            ? 'border-blue-500/50 bg-blue-600/10 text-white'
                            : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                            selected ? 'bg-blue-600 border-blue-600' : 'border-neutral-600 group-hover:border-neutral-400'
                          }`}>
                            {selected && (
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-black tracking-widest ${selected ? 'text-blue-400' : 'text-neutral-600'}`}>
                                {task.codigo}
                              </span>
                              {/* Cylinder badge: shows count when task scales by cylinders */}
                              {wheelBased === false && isCylinderTask(task) && (
                                <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                                  selected ? 'bg-neutral-600/40 text-neutral-300' : 'bg-neutral-800/60 text-neutral-500'
                                }`}>
                                  {cylinders} cil.
                                </span>
                              )}
                              {/* Wheel badge: shows multiplier when task scales by wheels */}
                              {wheelBased && (
                                <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                                  selected ? 'bg-blue-600/30 text-blue-300' : 'bg-blue-900/30 text-blue-600'
                                }`}>
                                  ×{wheels} {t('mechanicTaskModal.wheels').toLowerCase()}
                                </span>
                              )}
                              {/* Category badge during global search */}
                              {searchQuery.trim() && task._sectionLabel && (
                                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-neutral-800 text-neutral-500">
                                  {task._sectionLabel}
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-medium truncate block">{task.tarea}</span>
                          </div>
                        </div>
                        <span className={`text-xs font-black shrink-0 ${selected ? 'text-blue-400' : 'text-neutral-600'}`}>
                          {hours.toFixed(1)} h
                        </span>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* Right: Summary panel */}
          <div className="w-[35%] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-neutral-800/40 shrink-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-3">{t('mechanicTaskModal.workSummary')}</p>

              {/* Hours summary */}
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-4xl font-black text-white mb-1">
                      {totalHours.toFixed(1)}<span className="text-lg text-neutral-500 ml-1">h</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{t('mechanicTaskModal.estimatedMinutes', { count: totalMinutes })}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-blue-400 mb-1">
                      {(totalHours * (appointment?.workshopHourlyRate ?? 50.0)).toFixed(2)}<span className="text-xs text-neutral-500 ml-1">€</span>
                    </div>
                    <p className="text-[9px] text-neutral-500 uppercase tracking-widest">
                      {t('mechanicTaskModal.laborRateLabel', { rate: (appointment?.workshopHourlyRate ?? 50.0).toFixed(2) })}
                    </p>
                  </div>
                </div>
                {totalHours > 8 && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <p className="text-amber-400 text-[10px] font-black uppercase tracking-wider">
                      {t('mechanicTaskModal.multiDayWarning')}
                    </p>
                  </div>
                )}
              </div>

              {/* Controls in Summary Panel */}
              <div className="flex flex-col gap-3 mb-4">
                {showCylinderCounter && (
                  <div className="flex items-center justify-between p-3 bg-neutral-800/20 border border-neutral-700/20 rounded-2xl">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">{t('mechanicTaskModal.engine')}</span>
                      <span className="text-xs text-white font-bold">{t('mechanicTaskModal.cylinders')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setCylinders(c => Math.max(0, c - 1))}
                        className="w-7 h-7 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 flex items-center justify-center transition-all active:scale-90"
                      >−</button>
                      <span className={`text-sm font-black w-4 text-center ${cylinders === 0 ? 'text-red-400' : 'text-white'}`}>{cylinders}</span>
                      <button
                        onClick={() => setCylinders(c => Math.min(16, c + 1))}
                        className="w-7 h-7 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 flex items-center justify-center transition-all active:scale-90"
                      >+</button>
                    </div>
                  </div>
                )}

                {showWheelCounter && (
                  <div className="flex items-center justify-between p-3 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-blue-500/60 uppercase tracking-widest">{t('mechanicTaskModal.wheels')}</span>
                      <span className="text-xs text-blue-400 font-bold">{t('mechanicTaskModal.replacement')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setWheels(w => Math.max(0, w - 1))}
                        className="w-7 h-7 rounded-lg bg-blue-900/40 text-blue-300 border border-blue-700/30 hover:bg-blue-800 flex items-center justify-center transition-all active:scale-90"
                      >−</button>
                      <span className={`text-sm font-black w-4 text-center ${wheels === 0 ? 'text-red-400' : 'text-blue-300'}`}>{wheels}</span>
                      <button
                        onClick={() => setWheels(w => Math.min(8, w + 1))}
                        className="w-7 h-7 rounded-lg bg-blue-900/40 text-blue-300 border border-blue-700/30 hover:bg-blue-800 flex items-center justify-center transition-all active:scale-90"
                      >+</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Selected tasks list */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
              {selectedTasks.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-10 h-10 text-neutral-700 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-neutral-600 text-xs">{t('mechanicTaskModal.selectTasksHint')}</p>
                </div>
              ) : (
                selectedTasks.map(({ task }) => (
                  <div key={task.codigo} className="flex items-center justify-between gap-2 px-3 py-2 bg-blue-600/5 border border-blue-500/20 rounded-xl">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-wider">{task.codigo}</p>
                      <p className="text-xs text-neutral-300 truncate">{task.tarea}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-black text-blue-400">{calcHoursForTask(task, cylinders, wheels).toFixed(1)}h</span>
                      <button
                        onClick={() => toggleTask(task)}
                        className="w-5 h-5 flex items-center justify-center text-neutral-500 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer: error + submit */}
            <div className="p-5 border-t border-neutral-800/50 shrink-0 space-y-3">
              {error && (
                <p className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
              )}
              <button
                onClick={handleSubmit}
                disabled={loading || selectedTasks.length === 0}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    {t('mechanicTaskModal.planHours', { hours: totalHours.toFixed(1) })}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
