import React from 'react';
import { PlanningTimeline } from './PlanningTimeline';

interface AppointmentsTabProps {
  appointments: any[];
  selectedDate: Date;
  employees: any[];
  openTime?: string;
  closeTime?: string;
  onRescheduleTask?: (appointmentId: string, employeeId: string | null, newDateTime: Date, newDuration?: number) => Promise<void>;
  onUpdateStatus?: (id: string, status: string) => Promise<boolean | void>;
  onDeleteAppointment?: (id: string) => Promise<boolean | void>;
}

export const AppointmentsTab: React.FC<AppointmentsTabProps> = ({ 
    appointments, 
    selectedDate, 
    employees, 
    openTime = '09:00', 
    closeTime = '18:00',
    onRescheduleTask,
    onUpdateStatus,
    onDeleteAppointment
}) => {
  // Preparamos las columnas para el Manager (todas)
  const mechanics = employees.filter(e => e.role === 'WORKSHOP_STAFF' || e.role === 'WORKSHOP_MANAGER');
  const columns = [
    { id: 'unassigned', title: 'SIN ASIGNAR', employeeId: null },
    ...mechanics.map(m => ({
      id: m.id,
      title: `${m.firstname} ${m.lastname}`.trim() || 'Mecánico',
      employeeId: m.id as string
    }))
  ];

  return (
    <div className="bg-neutral-900/20 p-6 rounded-[2rem] border border-neutral-800/60 overflow-hidden">
      <PlanningTimeline 
        columns={columns}
        appointments={appointments}
        selectedDate={selectedDate}
        openTime={openTime}
        closeTime={closeTime}
        onRescheduleTask={onRescheduleTask}
        onUpdateStatus={onUpdateStatus}
        onDeleteAppointment={onDeleteAppointment}
      />
    </div>
  );
};
