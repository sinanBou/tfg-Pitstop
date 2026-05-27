import React from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { getBrandLogo } from '@/components/common/SearchableSelect/BrandLogos';

interface PendingAppointmentsListProps {
  appointments: any[];
  onConfirmAppointment: (id: string) => void;
}

/**
 * Premium modularized card list for appointments pending confirmation.
 */
export const PendingAppointmentsList: React.FC<PendingAppointmentsListProps> = ({
  appointments,
  onConfirmAppointment
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-white font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-3">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        Pendientes de Confirmar
        <span className="bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full text-[10px]">
          {appointments.length}
        </span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.length > 0 ? (
          appointments.map((app: any) => (
            <Card
              key={app.id}
              variant="neutral"
              border={false}
              padding="none"
              rounded="2xl"
              className="bg-yellow-500/5 p-5 border border-yellow-500/20 flex flex-col justify-between group relative overflow-hidden transition-all duration-300 hover:border-yellow-500/40"
            >
              <div>
                <div className="text-[10px] font-black uppercase text-yellow-500 tracking-widest mb-1.5">
                  {app.serviceType}
                </div>
                
                <div className="flex items-center gap-2 mt-1 mb-2">
                  <div className="w-6 h-6 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-yellow-500 shadow-inner group-hover:bg-yellow-600 group-hover:text-black transition-all [&_svg]:w-4 [&_svg]:h-4 [&_div]:w-4 [&_div]:text-[8px] flex-shrink-0">
                    {getBrandLogo(app.vehicleDisplay ? app.vehicleDisplay.split(' ')[0] : '')}
                  </div>
                  <div className="text-lg font-black text-white leading-none">
                    {app.vehicleDisplay}
                  </div>
                </div>

                {app.clientFullName && (
                  <div className="text-neutral-400 text-xs font-bold mt-1">
                    Cliente: <span className="text-neutral-200">{app.clientFullName}</span>
                  </div>
                )}

                <div className="text-neutral-400 text-xs font-mono mt-3 mb-4">
                  {new Date(app.dateTime).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}{' '}
                  {new Date(app.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}{' '}
                  h
                </div>
              </div>

              <Button
                onClick={() => onConfirmAppointment(app.id)}
                className="w-full !py-2.5 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-black mt-2 animate-pulse-subtle"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Confirmar Cita
              </Button>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-neutral-500 text-xs uppercase tracking-widest font-bold">
            Todo al día. No hay citas por confirmar.
          </div>
        )}
      </div>
    </div>
  );
};
