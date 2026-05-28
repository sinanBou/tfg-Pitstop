import { ClientAppointmentCard } from '@/components/common/Card/index';

const CalendarIcon = () => (<svg className="w-8 h-8 text-neutral-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);

interface ClientAppointmentsTabProps {
  appointments: any[];
  onAddAppointment: () => void;
  deleteAppointment: (id: string) => void;
}

export function ClientAppointmentsTab({ appointments, onAddAppointment, deleteAppointment }: ClientAppointmentsTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
         <p className="text-neutral-500 text-sm font-medium">Solicita y gestiona tus revisiones</p>
         <button 
            onClick={onAddAppointment}
            className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/30 font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.1)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] flex items-center gap-2"
         >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            Nueva Cita
         </button>
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
               <CalendarIcon />
               <p className="text-neutral-500 font-black uppercase tracking-widest mt-4">Sin citas programadas</p>
            </div>
         )}
      </div>
    </div>
  );
}
