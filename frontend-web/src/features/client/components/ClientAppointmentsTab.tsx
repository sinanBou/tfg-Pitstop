import { ClientAppointmentCard } from '@/components/common/Card/ClientAppointmentCard';
import { Button } from '@/components/common/Button/Button';
import { Calendar } from '@/assets/icons';
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

/**
 * Pestaña de listado y solicitud de citas del Cliente.
 * Renderiza tarjetas de citas del cliente con soporte de cancelación directa.
 */
export function ClientAppointmentsTab({ appointments, onAddAppointment, deleteAppointment }: ClientAppointmentsTabProps) {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
         <p className="text-neutral-500 text-sm font-medium">{t('clientDashboard.manageAppointmentsSub')}</p>
         <Button 
            onClick={onAddAppointment}
            variant="primary"
            className="shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] flex items-center gap-2"
         >
            <Calendar className="w-4 h-4" />
            {t('clientDashboard.newAppointmentBtn')}
         </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {appointments.length > 0 ? (
            appointments.map((app) => (
               <ClientAppointmentCard 
                  key={app.id} 
                  appointment={app} 
                  deleteAppointment={deleteAppointment} 
               />
            ))
         ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-40">
               <Calendar className="w-8 h-8 text-neutral-600 mb-2" strokeWidth={1.5} />
               <p className="text-neutral-500 font-black uppercase tracking-widest mt-4">{t('clientDashboard.noAppointments')}</p>
            </div>
         )}
      </div>
    </div>
  );
}
