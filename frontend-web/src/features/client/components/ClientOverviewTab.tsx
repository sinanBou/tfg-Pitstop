import type { UserDTO } from '../types/client.types';
import { WorkshopVehicleCard } from '@/components/common/Card/WorkshopVehicleCard';
import { Card } from '@/components/common/Card/Card';
import { Mail, Car, Calendar } from '@/assets/icons';
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
}

/**
 * Pestaña resumen/vista general para el panel del Cliente.
 * Muestra el saludo personalizado, KPIs de vehículos/citas,
 * y un listado de coches que están actualmente en reparación en el taller físico
 * con sus correspondientes estados de servicio actualizados en tiempo real.
 */
export function ClientOverviewTab({ vehicles, appointments, userProfile }: ClientOverviewTabProps) {
  const { t } = useTranslation();

  // Override status dynamically to follow strict business rules:
  // - If a vehicle has an active appointment in status 'COMPLETED', it's 'COMPLETED' ("Listo para Recoger").
  // - If it has an active appointment in status 'IN_PROGRESS', it's 'IN_PROGRESS' ("En Curso").
  // - If 'DELAYED', it's 'DELAYED' ("Retrasado").
  // - If 'CONFIRMED', it's 'CONFIRMED' ("Confirmado").
  // - If 'PENDING', it's 'PENDING' ("Pendiente").
  // - If no active appointment (meaning not in workshop, or already PICKED_UP / delivered), it remains 'EN_CASA'.
  const cochesConEstadoModificado = vehicles.map((v) => {
    const activeApp = appointments.find(
      (app) => app.vehicleId === v.id && !['CANCELLED', 'PICKED_UP'].includes(app.status)
    );
    
    if (!activeApp) {
      return { ...v, status: 'EN_CASA' };
    }
    
    return { ...v, status: activeApp.status };
  });

  const cochesEnTaller = cochesConEstadoModificado.filter((v) => v.status !== 'EN_CASA');

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* SECTION: GREETING & PERSONAL INFO */}
      <Card variant="neutral" padding="none" rounded="2xl" className="p-8 md:p-10 relative overflow-hidden group">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
            <div>
               <p className="text-[10px] uppercase font-bold tracking-widest text-blue-500 mb-2 flex items-center gap-2">
                  {t('clientDashboard.clientPortal')}
               </p>
               <h2 className="text-3xl md:text-5xl font-black tracking-tighter  mb-2">
                 {t('clientDashboard.hello')}, {userProfile?.firstname || t('common.driver')}
               </h2>
               <p className="text-neutral-400 font-medium tracking-wide flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-neutral-500" />
                  {userProfile?.email || t('common.loading')}
               </p>
            </div>
         </div>
      </Card>

      {/* SECTION: VISTA GENERAL METRICAS (Colocado Arriba) */}
      <div className="space-y-6">
         <h3 className="text-sm font-black text-neutral-500 uppercase tracking-widest">{t('clientDashboard.accountSummary')}</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicles.length > 0 ? (
               <Card variant="neutral" padding="none" rounded="2xl" className="p-6 relative overflow-hidden group hover:border-blue-500/40 transition-all duration-300 hover:shadow-2xl">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-110 group-hover:-rotate-3 duration-500 pointer-events-none">
                     <Car className="w-16 h-16 text-blue-500" strokeWidth={1} />
                  </div>
                  <div className="relative z-10 flex flex-col h-full">
                     <h4 className="text-neutral-400 font-bold uppercase tracking-widest text-xs mb-4">{t('clientDashboard.yourGarage')}</h4>
                     <p className="text-4xl font-black text-white leading-none mb-1">{vehicles.length}</p>
                     <p className="text-[10px] font-mono text-blue-400 uppercase tracking-widest mt-auto">{t('clientDashboard.activeVehicles')}</p>
                  </div>
               </Card>
            ) : (
               <Card variant="neutral" padding="none" rounded="2xl" className="p-6 relative overflow-hidden group transition-all duration-300">
                  <div className="relative z-10 flex flex-col items-center justify-center text-center h-full opacity-50">
                     <p className="text-lg font-black text-white uppercase mb-1">{t('clientDashboard.noActivity')}</p>
                     <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">{t('clientDashboard.emptyGarage')}</p>
                  </div>
               </Card>
            )}
            
            <Card variant="neutral" padding="none" rounded="2xl" className="p-6 relative overflow-hidden group hover:border-blue-500/40 transition-all duration-300 hover:shadow-2xl">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-110 group-hover:-rotate-3 duration-500 pointer-events-none">
                  <Calendar className="w-16 h-16 text-blue-500" strokeWidth={1} />
               </div>
               <div className="relative z-10 flex flex-col h-full">
                  <h4 className="text-neutral-400 font-bold uppercase tracking-widest text-xs mb-4">{t('nav.appointments')}</h4>
                  <p className="text-4xl font-black text-white leading-none mb-1">{appointments.length}</p>
               </div>
            </Card>
         </div>
      </div>

      {/* SECTION: EN REPARACIÓN (Deslizador Horizontal Premium - Colocado Abajo) */}
      {cochesEnTaller.length > 0 && (
         <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
               <h3 className="text-sm font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                  {t('clientDashboard.inRepair')} ({cochesEnTaller.length})
               </h3>
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
    </div>
  );
}
