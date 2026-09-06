import { useMemo } from 'react';
import type { UserDTO } from '../types/client.types';
import { WorkshopVehicleCard } from '@/components/common/Card/WorkshopVehicleCard';
import { Card } from '@/components/common/Card/Card';
import { 
  Mail, 
  Car, 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle, 
  ArrowRight,
  ChevronRight
} from '@/assets/icons';
import { useTranslation } from '@/i18n';

/**
 * Propiedades del componente ClientOverviewTab.
 */
interface ClientOverviewTabProps {
  /** Listado de vehículos del cliente. */
  vehicles: any[];
  /** Listado de citas de reparación del cliente. */
  appointments: any[];
  /** Perfil del usuario autenticado (opcional). */
  userProfile?: UserDTO | null;
  /** Callback para abrir modal de nuevo vehículo (opcional). */
  onAddVehicle?: () => void;
  /** Callback para abrir modal de nueva cita (opcional). */
  onAddAppointment?: () => void;
  /** Callback para navegar a una pestaña específica (opcional). */
  onNavigateTab?: (tabIndex: number) => void;
}

/**
 * Pestaña resumen / Command Center del portal de cliente PitStop.
 * Presenta KPIs operacionales de la flota del conductor, avisos de recogida en tiempo real,
 * foco en la próxima cita programada y el dock de vehículos en servicio activo.
 */
export function ClientOverviewTab({ 
  vehicles, 
  appointments, 
  userProfile,
  onAddVehicle,
  onAddAppointment,
  onNavigateTab
}: ClientOverviewTabProps) {
  const { t } = useTranslation();

  // Mapeo dinámico de estados de los vehículos según reglas de negocio
  const cochesConEstadoModificado = useMemo(() => {
    return vehicles.map((v) => {
      const activeApp = appointments.find(
        (app) => app.vehicleId === v.id && !['CANCELLED', 'PICKED_UP'].includes(app.status)
      );
      
      if (!activeApp) {
        return { ...v, status: 'EN_CASA' };
      }
      
      return { ...v, status: activeApp.status };
    });
  }, [vehicles, appointments]);

  const cochesEnTaller = useMemo(() => {
    return cochesConEstadoModificado.filter((v) => v.status !== 'EN_CASA');
  }, [cochesConEstadoModificado]);

  const cochesListos = useMemo(() => {
    return cochesEnTaller.filter((v) => v.status === 'COMPLETED');
  }, [cochesEnTaller]);

  const activeAppointments = useMemo(() => {
    return appointments.filter(a => !['CANCELLED', 'PICKED_UP'].includes(a.status));
  }, [appointments]);

  const completedAppointments = useMemo(() => {
    return appointments.filter(a => ['COMPLETED', 'PICKED_UP'].includes(a.status));
  }, [appointments]);

  // Próxima cita cronológicamente activa
  const nextAppointment = useMemo(() => {
    const upcoming = appointments
      .filter(a => !['CANCELLED', 'PICKED_UP', 'COMPLETED'].includes(a.status))
      .sort((a, b) => new Date(a.dateTime || a.date).getTime() - new Date(b.dateTime || b.date).getTime());
    return upcoming[0] || null;
  }, [appointments]);

  const driverInitials = (userProfile?.firstname?.[0] || 'C').toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── BANNER HERO: DRIVER COMMAND CENTER ── */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-neutral-800/80 bg-white/95 dark:bg-neutral-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        {/* Glow decorativo de fondo */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 dark:bg-blue-500/15 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Avatar / Iniciales del conductor */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0 border border-white/20">
              {driverInitials}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest">
                  {t('clientDashboard.clientPortal')}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 text-[9px] font-bold font-mono">
                  {vehicles.length} {t('common.vehicle')}{vehicles.length !== 1 ? 's' : ''}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {t('clientDashboard.hello')}, {userProfile?.firstname || t('common.driver')}
              </h2>

              <p className="text-slate-500 dark:text-neutral-400 font-medium text-xs flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                <span>{userProfile?.email || t('common.loading')}</span>
              </p>
            </div>
          </div>

          {/* Accesos de Acción Rápida */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-neutral-800">
            {onAddAppointment && (
              <button
                onClick={onAddAppointment}
                className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-600/20 hover:shadow-blue-600/35 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                <span>{t('clientDashboard.newAppointmentBtn')}</span>
              </button>
            )}

            {onAddVehicle && (
              <button
                onClick={onAddVehicle}
                className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-300/80 dark:border-white/10 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{t('clientDashboard.addVehicle')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── BANNER ALERTA: VEHÍCULO LISTO PARA RECOGER (Si aplica) ── */}
      {cochesListos.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20 animate-bounce">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  {t('appointmentCard.readyBannerTitle')}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[8px] font-black uppercase">
                  {cochesListos.length} {cochesListos.length === 1 ? t('common.vehicle') : t('clientDashboard.activeVehicles')}
                </span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400/90 font-medium mt-0.5">
                {t('appointmentCard.readyBannerDesc')}
              </p>
            </div>
          </div>

          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab(2)}
              className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 self-start sm:self-center shrink-0 cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <span>{t('nav.appointments')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ── GRID DE 4 KPIS OPERATIVOS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Mi Garaje */}
        <div 
          onClick={() => onNavigateTab?.(1)}
          className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-neutral-900/80 border border-slate-200/80 dark:border-neutral-800/80 shadow-sm hover:border-blue-500/40 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-neutral-400">
              {t('clientDashboard.yourGarage')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white leading-none">
              {vehicles.length}
            </span>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mt-2 flex items-center gap-1">
              <span>{t('clientDashboard.activeVehicles')}</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </div>

        {/* KPI 2: Citas Programadas */}
        <div 
          onClick={() => onNavigateTab?.(2)}
          className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-neutral-900/80 border border-slate-200/80 dark:border-neutral-800/80 shadow-sm hover:border-blue-500/40 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-neutral-400">
              {t('nav.appointments')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white leading-none">
              {activeAppointments.length}
            </span>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mt-2 flex items-center gap-1">
              <span>{t('clientReports.totalAppointments')}</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </div>

        {/* KPI 3: En Reparación / Taller */}
        <div 
          onClick={() => onNavigateTab?.(0)}
          className={`p-4 sm:p-5 rounded-2xl border shadow-sm transition-all group flex flex-col justify-between ${
            cochesEnTaller.length > 0
              ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30'
              : 'bg-white/90 dark:bg-neutral-900/80 border-slate-200/80 dark:border-neutral-800/80'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-neutral-400">
              {t('clientDashboard.inRepair')}
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              cochesEnTaller.length > 0
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                : 'bg-slate-100 dark:bg-neutral-800 text-slate-500'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black font-mono text-slate-900 dark:text-white leading-none">
                {cochesEnTaller.length}
              </span>
              {cochesEnTaller.length > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600" />
                </span>
              )}
            </div>
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider mt-2">
              {cochesEnTaller.length > 0 ? t('status.inProgress') : t('clientDashboard.noActivity')}
            </p>
          </div>
        </div>

        {/* KPI 4: Historial Completado */}
        <div 
          onClick={() => onNavigateTab?.(3)}
          className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-neutral-900/80 border border-slate-200/80 dark:border-neutral-800/80 shadow-sm hover:border-blue-500/40 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-neutral-400">
              {t('nav.history')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white leading-none">
              {completedAppointments.length}
            </span>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider mt-2 flex items-center gap-1">
              <span>{t('clientHistory.activityNotifs')}</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </div>
      </div>

      {/* ── SPOTLIGHT: PRÓXIMA CITA PROGRAMADA (Si existe) ── */}
      {nextAppointment && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white/95 dark:bg-neutral-900/90 border border-slate-200/80 dark:border-neutral-800/80 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-neutral-800 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                  {t('clientAppointmentModal.scheduledDate')}
                </span>
                <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {nextAppointment.serviceType || t('appointmentsTab.appointmentLabel')}
                </h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-neutral-400 font-medium mt-0.5">
                  <span className="font-mono font-bold text-slate-800 dark:text-neutral-200">
                    {nextAppointment.date} {nextAppointment.time ? `· ${nextAppointment.time}` : ''}
                  </span>
                  <span>•</span>
                  <span>{nextAppointment.workshopName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-center">
              <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400">
                {nextAppointment.status}
              </span>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab(2)}
                  className="h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-300 dark:border-white/10 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer text-slate-800 dark:text-white"
                >
                  <span>Ver Cita</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION: EN REPARACIÓN (Dock Horizontal) ── */}
      {cochesEnTaller.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                {t('clientDashboard.inRepair')} ({cochesEnTaller.length})
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 font-mono">
              {t('workshopVehicleCard.repairProgress')}
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x scroll-smooth">
            {cochesEnTaller.map((vehicle) => (
              <div key={vehicle.id} className="snap-start shrink-0">
                <WorkshopVehicleCard vehicle={vehicle} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ESTADO VACÍO CUANDO NO HAY COCHES REGISTRADOS ── */}
      {vehicles.length === 0 && (
        <Card variant="neutral" padding="none" rounded="2xl" className="p-10 text-center border-dashed flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <Car className="w-7 h-7" />
          </div>
          <h4 className="text-lg font-black uppercase text-slate-900 dark:text-white tracking-wider mb-1">
            {t('clientDashboard.emptyGarage')}
          </h4>
          <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-md mb-6">
            {t('clientDashboard.noVehicles')}
          </p>
          {onAddVehicle && (
            <button
              onClick={onAddVehicle}
              className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>{t('clientDashboard.addVehicle')}</span>
            </button>
          )}
        </Card>
      )}
    </div>
  );
}

