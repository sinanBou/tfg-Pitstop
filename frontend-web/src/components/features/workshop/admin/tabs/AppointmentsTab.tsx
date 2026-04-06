import React from 'react';
import { AppointmentCard } from '../../../../common/Card/index';

interface AppointmentsTabProps {
  appointments: any[];
  selectedDate: Date;
}

export const AppointmentsTab: React.FC<AppointmentsTabProps> = ({ appointments, selectedDate }) => {
  const filteredAppointments = appointments.filter(app => {
    const appDate = new Date(app.dateTime);
    return appDate.getFullYear() === selectedDate.getFullYear() &&
           appDate.getMonth() === selectedDate.getMonth() &&
           appDate.getDate() === selectedDate.getDate();
  });

  return (
    <div className="space-y-6">
      {filteredAppointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
          {filteredAppointments.map((app) => (
            <AppointmentCard 
              key={app.id} 
              type={app.serviceType} 
              dateTime={app.dateTime} 
              description={app.description} 
              status={app.status} 
              variant="red" // Workshop Admin uses red
            />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center bg-black/40 border border-neutral-900 rounded-[3rem] opacity-40">
           <p className="text-neutral-500 font-black uppercase tracking-widest text-sm">No hay citas registradas para hoy</p>
        </div>
      )}
    </div>
  );
};
