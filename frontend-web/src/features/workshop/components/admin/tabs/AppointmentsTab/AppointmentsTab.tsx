import React from 'react';
import { PlanningTimeline } from './PlanningTimeline';
import { Card } from '@/components/common/Card/Card';
import { useTranslation } from '@/i18n';

/**
 * Propiedades del componente AppointmentsTab.
 */
interface AppointmentsTabProps {
  /** Colección de citas y tareas registradas en el sistema. */
  appointments: any[];
  /** Día seleccionado para visualizar la agenda. */
  selectedDate: Date;
  /** Plantilla de empleados asociados al taller. */
  employees: any[];
  /** Hora de apertura comercial. Por defecto '09:00'. */
  openTime?: string;
  /** Hora de cierre comercial. Por defecto '18:00'. */
  closeTime?: string;
  /** Callback para cambiar de fecha/hora/mecánico una tarea. */
  onRescheduleTask?: (appointmentId: string, employeeId: string | null, newDateTime: Date, newDuration?: number) => Promise<void>;
  /** Callback para actualizar el estado de una cita/tarea. */
  onUpdateStatus?: (id: string, status: string, isTask?: boolean) => Promise<boolean | void>;
  /** Callback para eliminar permanentemente una cita de cliente. */
  onDeleteAppointment?: (id: string) => Promise<boolean | void>;
  /** Callback para borrar una tarea de taller. */
  onDeleteTask?: (id: string) => Promise<boolean | void>;
  /** Callback para abrir la modal de gestión del vehículo. */
  onManage?: (app: any) => void;
  /** Callback para visualizar la checklist de la tarea asignada. */
  onViewChecklist?: (app: any) => void;
  /** Permite al propietario actuar como mecánico y aparecer en la agenda general. */
  includeOwnerInPlanning?: boolean;
}

/**
 * Pestaña de Agenda/Planning del panel de Administración de Taller.
 * Filtra el listado de empleados elegibles para planificación de citas (Mecánicos,
 * Gestores, Propietarios si está habilitado) y monta el PlanningTimeline interactivo.
 */
export const AppointmentsTab: React.FC<AppointmentsTabProps> = ({ 

    appointments, 
    selectedDate, 
    employees, 
    openTime = '09:00', 
    closeTime = '18:00',
    onRescheduleTask,
    onUpdateStatus,
    onDeleteAppointment,
    onDeleteTask,
    onManage,
    onViewChecklist,
    includeOwnerInPlanning = false
}) => {
  const { t } = useTranslation();

  // Preparamos las columnas para el Manager (todas)
  const mechanics = employees.filter(e => {
    if (e.role === 'WORKSHOP_STAFF' || e.role === 'WORKSHOP_MANAGER') return true;
    if (e.role === 'WORKSHOP_OWNER' && includeOwnerInPlanning) return true;
    return false;
  });
  const columns = [
    { id: 'unassigned', title: t('appointmentsTab.unassigned'), employeeId: null },
    ...mechanics.map(m => ({
      id: m.id,
      title: `${m.firstname} ${m.lastname}`.trim() || t('appointmentsTab.mechanic'),
      employeeId: m.id as string,
      role: m.role === 'WORKSHOP_OWNER' ? t('appointmentsTab.owner') : m.role === 'WORKSHOP_MANAGER' ? t('appointmentsTab.manager') : t('appointmentsTab.mechanic'),
      profilePictureUrl: m.profilePictureUrl
    }))
  ];

  return (
    <Card 
      variant="neutral"
      rounded="2xl"
      padding="sm"
      className="bg-transparent border-none shadow-none overflow-hidden"
    >
      <PlanningTimeline 
        columns={columns}
        appointments={appointments}
        selectedDate={selectedDate}
        openTime={openTime}
        closeTime={closeTime}
        onRescheduleTask={onRescheduleTask}
        onUpdateStatus={onUpdateStatus}
        onDeleteAppointment={onDeleteAppointment}
        onDeleteTask={onDeleteTask}
        onManage={onManage}
        onViewChecklist={onViewChecklist}
      />
    </Card>
  );
};
