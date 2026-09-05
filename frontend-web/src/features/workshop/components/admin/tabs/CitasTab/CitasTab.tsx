import React from 'react';
import { Card } from '@/components/common/Card/Card';
import { ChevronsRight } from '@/assets/icons';
import { Button } from '@/components/common/Button/Button';
import { AppointmentSearch } from '@/features/workshop/components/admin/AppointmentSearch/index';
import { DateNavigator } from '@/components/common/DateNavigator/DateNavigator';
import { PendingAppointmentsList } from './PendingAppointmentsList';
import { ConfirmedAppointmentsList } from './ConfirmedAppointmentsList';
import { useTranslation } from '@/i18n';

/**
 * Propiedades del componente CitasTab.
 */
interface CitasTabProps {
  /** Colección de citas confirmadas o activas para el día seleccionado. */
  appointments: any[];
  /** Colección de solicitudes de citas que aún están en estado PENDING. */
  pendingAppointments: any[];
  /** Fecha activa seleccionada en el navegador diario. */
  selectedDate: Date;
  /** Callback para cambiar la fecha activa en el estado del contenedor. */
  setSelectedDate: (date: Date) => void;
  /** Callback para navegar automáticamente a la fecha del siguiente aviso/cita pendiente. */
  goToNextPendingDate: () => void;
  /** Callback asíncrono para actualizar el estado de una cita (ej: confirmar, rechazar). */
  updateAppointmentStatus: (id: string, status: string) => Promise<boolean | void>;
  /** Callback asíncrono para eliminar/cancelar una cita. */
  handleDeleteAppointment: (id: string) => Promise<boolean | void>;
  /** Callback opcional para recepcionar físicamente un vehículo en el taller, registrando kilómetros y notas de entrada. */
  checkInVehicle?: (id: string, kilometers: number, notes: string) => Promise<boolean>;
}

/**
 * Pestaña de Citas en el panel de Administración de Taller.
 * Gestiona la recepción de solicitudes pendientes (confirmar o rechazar) y el listado de citas confirmadas del día.
 * Proporciona un buscador de citas, navegación de fecha diaria y la funcionalidad para
 * registrar ("Check-In") un coche cuando entra físicamente al taller.
 */
export const CitasTab: React.FC<CitasTabProps> = ({
  appointments,
  pendingAppointments,
  selectedDate,
  setSelectedDate,
  goToNextPendingDate,
  updateAppointmentStatus,
  handleDeleteAppointment,
  checkInVehicle
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-12 animate-fade-in-up">
      <Card
        variant="neutral"
        rounded="2xl"
        padding="lg"
        className="bg-neutral-900/30 border-neutral-800/60"
      >
        {/* Toolbar: Pendientes + Calendario */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <AppointmentSearch appointments={appointments} onSelectDate={setSelectedDate} />
          <Button
            variant="secondary"
            onClick={goToNextPendingDate}
            className="!px-5 !py-3 bg-yellow-600/10 hover:bg-yellow-600/20 text-yellow-500 border border-yellow-600/20 hover:border-yellow-500/40 group/btn"
          >
            <ChevronsRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            {t('citasTab.pendingBtn')}
          </Button>
          <div className="ml-auto">
            <DateNavigator selectedDate={selectedDate} onChange={setSelectedDate} variant="red" />
          </div>
        </div>

        <PendingAppointmentsList 
          appointments={pendingAppointments} 
          onConfirmAppointment={(id) => updateAppointmentStatus(id, 'CONFIRMED')}
          onRejectAppointment={(id) => updateAppointmentStatus(id, 'CANCELLED')}
        />
        
        {pendingAppointments.length > 0 && (
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-6 text-center">
            {t('citasTab.confirmedMoveInfo')}
          </p>
        )}
        
        <ConfirmedAppointmentsList 
          appointments={appointments} 
          onDeleteAppointment={handleDeleteAppointment} 
          onCheckInAppointment={checkInVehicle}
          onUpdateStatus={updateAppointmentStatus}
        />
      </Card>
    </div>
  );
};

