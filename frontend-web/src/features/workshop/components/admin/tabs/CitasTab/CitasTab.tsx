import React from 'react';
import { Card } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { AppointmentSearch } from '@/features/workshop/components/admin/AppointmentSearch/index';
import { DateNavigator } from '@/components/common/DateNavigator/DateNavigator';
import { PendingAppointmentsList } from './PendingAppointmentsList';
import { ConfirmedAppointmentsList } from './ConfirmedAppointmentsList';

interface CitasTabProps {
  appointments: any[];
  pendingAppointments: any[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  goToNextPendingDate: () => void;
  updateAppointmentStatus: (id: string, status: string) => Promise<boolean | void>;
  handleDeleteAppointment: (id: string) => Promise<boolean | void>;
  checkInVehicle?: (id: string, kilometers: number, notes: string) => Promise<boolean>;
}

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
            <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            Pendientes
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
            Las citas confirmadas se moverán a la pestaña "Planificación" para ser asignadas.
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
