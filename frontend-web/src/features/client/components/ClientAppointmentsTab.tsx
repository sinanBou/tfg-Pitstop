import { useState, useMemo } from 'react';
import { ClientAppointmentCard } from '@/components/common/Card/ClientAppointmentCard';
import { Calendar, CheckCircle, Plus } from '@/assets/icons';
import { useTranslation } from '@/i18n';

/**
 * Propiedades del componente ClientAppointmentsTab.
 */
interface ClientAppointmentsTabProps {
  /** Colección de citas activas asociadas al cliente. */
  appointments: any[];
  /** Callback para abrir el modal de reserva de citas. */
  onAddAppointment: () => void;
  /** Callback para cancelar o eliminar una cita existente. */
  deleteAppointment: (id: string) => void;
}

type FilterType = 'all' | 'active' | 'ready' | 'completed';

/**
 * Pestaña de listado y seguimiento de citas del Cliente.
 * Renderiza tarjetas de citas con filtros de estado y seguimiento de ciclo de vida.
 */
export function ClientAppointmentsTab({ appointments, onAddAppointment, deleteAppointment }: ClientAppointmentsTabProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterType>('all');

  const activeCount = useMemo(() => {
    return appointments.filter(a => ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'DELAYED'].includes(a.status)).length;
  }, [appointments]);

  const readyCount = useMemo(() => {
    return appointments.filter(a => a.status === 'COMPLETED').length;
  }, [appointments]);

  const completedCount = useMemo(() => {
    return appointments.filter(a => ['COMPLETED', 'PICKED_UP', 'CANCELLED'].includes(a.status)).length;
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    switch (filter) {
      case 'active':
        return appointments.filter(a => ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'DELAYED'].includes(a.status));
      case 'ready':
        return appointments.filter(a => a.status === 'COMPLETED');
      case 'completed':
        return appointments.filter(a => ['COMPLETED', 'PICKED_UP', 'CANCELLED'].includes(a.status));
      default:
        return appointments;
    }
  }, [appointments, filter]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Barra de Filtros y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 dark:bg-neutral-900/80 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-neutral-800/80 shadow-sm">
        {/* Filtros por píldora */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
            }`}
          >
            <span>Todas</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-mono font-black ${
              filter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-neutral-700 text-slate-600 dark:text-neutral-400'
            }`}>
              {appointments.length}
            </span>
          </button>

          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'active'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
            }`}
          >
            <span>Próximas / En Curso</span>
            {activeCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-mono font-black ${
                filter === 'active' ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
              }`}>
                {activeCount}
              </span>
            )}
          </button>

          {readyCount > 0 && (
            <button
              onClick={() => setFilter('ready')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === 'ready'
                  ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
                  : 'bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-500/20'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Listas</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-mono font-black ${
                filter === 'ready' ? 'bg-white/20 text-white' : 'bg-green-500/20 text-green-700 dark:text-green-300'
              }`}>
                {readyCount}
              </span>
            </button>
          )}

          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'completed'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
            }`}
          >
            <span>Completadas</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-mono font-black ${
              filter === 'completed' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-neutral-700 text-slate-600 dark:text-neutral-400'
            }`}>
              {completedCount}
            </span>
          </button>
        </div>

        {/* Botón Nueva Cita */}
        <button
          onClick={onAddAppointment}
          className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>{t('clientDashboard.newAppointmentBtn')}</span>
        </button>
      </div>

      {/* Grid de Tarjetas de Cita */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((app) => (
            <ClientAppointmentCard 
              key={app.id} 
              appointment={app} 
              deleteAppointment={deleteAppointment} 
            />
          ))
        ) : (
          <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white/60 dark:bg-neutral-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-neutral-800">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-neutral-800 text-slate-400 dark:text-neutral-500 flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <p className="text-slate-700 dark:text-neutral-300 font-black uppercase tracking-widest text-xs">
              {filter === 'all' ? t('clientDashboard.noAppointments') : 'No hay citas con este filtro'}
            </p>
            <p className="text-slate-500 dark:text-neutral-500 text-[11px] mt-1">
              {t('clientDashboard.manageAppointmentsSub')}
            </p>
            {filter === 'all' && (
              <button
                onClick={onAddAppointment}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>{t('clientDashboard.newAppointmentBtn')}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
