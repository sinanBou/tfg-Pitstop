

const CalendarIcon = () => (<svg className="w-8 h-8 text-neutral-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);

const formatDateToDDMMAA = (dateString: string) => {
   if (!dateString) return '';
   const parts = dateString.split('-');
   if (parts.length === 3) {
      // YYYY-MM-DD to DD-MM-YY
      return `${parts[2]}-${parts[1]}-${parts[0].slice(-2)}`;
   }
   return dateString;
};

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
               <div key={app.id} className="bg-neutral-900/40 border border-neutral-800 p-6 md:p-8 rounded-[2rem] relative overflow-hidden group hover:border-blue-500/40 transition-all duration-300 flex flex-col hover:shadow-2xl hover:-translate-y-1">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-110 group-hover:-rotate-3 duration-500 pointer-events-none">
                     <svg className="w-32 h-32 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </div>
                  
                  <div className="relative z-10 flex-1">
                     <div className="flex justify-between items-start mb-6">
                         <div>
                            <h5 className="text-xl text-blue-400 font-bold uppercase tracking-wider mb-3 leading-tight w-full pr-4" style={{ wordBreak: 'break-word' }}>{app.serviceType}</h5>
                            <h4 className="text-2xl font-black text-white tracking-widest mb-1">{formatDateToDDMMAA(app.date)}</h4>
                            <p className="text-neutral-400 font-mono text-sm">{app.time}</p>
                        </div>
                        <span className={`shrink-0 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest ${
                          app.status === 'COMPLETED' 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : app.status === 'IN_PROGRESS'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : app.status === 'CONFIRMED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : app.status === 'DELAYED'
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                        }`}>
                           {app.status === 'COMPLETED' ? '✓ Listo' 
                            : app.status === 'IN_PROGRESS' ? 'En Proceso'
                            : app.status === 'CONFIRMED' ? 'Confirmada'
                            : app.status === 'DELAYED' ? 'Retrasada'
                            : app.status === 'CANCELLED' ? 'Cancelada'
                            : 'Pendiente'}
                        </span>
                     </div>
                     
                     {/* Ready for pickup banner */}
                     {app.status === 'COMPLETED' && (
                       <div className="flex items-center gap-3 px-5 py-4 bg-green-500/10 border border-green-500/20 rounded-2xl mb-4 animate-pulse">
                         <svg className="w-6 h-6 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                         </svg>
                         <div>
                           <p className="text-green-400 text-xs font-black uppercase tracking-widest">Vehículo Listo</p>
                           <p className="text-green-300/70 text-[11px] mt-0.5">Tu coche está preparado. Ya puedes pasar a recogerlo.</p>
                         </div>
                       </div>
                     )}

                     <div className="space-y-3 mb-8 mt-auto bg-black/30 p-5 rounded-2xl border border-white/5 shadow-inner">
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-neutral-500 font-bold uppercase tracking-wider text-[10px]">Vehículo</span>
                           <span className="text-white font-mono">{app.vehicleDisplay || app.vehiclePlate}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-neutral-500 font-bold uppercase tracking-wider text-[10px]">Taller</span>
                           <span className="text-white font-mono">{app.workshopName}</span>
                        </div>
                     </div>
                  </div>
                  
                   {/* Solo permitimos cancelar si no está en curso, completada o ya cancelada */}
                   {!['IN_PROGRESS', 'DELAYED', 'COMPLETED', 'CANCELLED'].includes(app.status) ? (
                      <button 
                        onClick={() => { if(window.confirm("¿Deseas cancelar esta cita de forma permanente?")) deleteAppointment(app.id); }} 
                        className="w-full py-4 bg-neutral-800/50 border border-neutral-700/50 text-neutral-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gradient-to-r hover:from-red-600 hover:to-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm relative z-10 group/btn mt-auto overflow-hidden"
                      >
                         <span className="flex items-center justify-center gap-2 relative z-10">
                            Cancelar Cita
                            <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                         </span>
                      </button>
                   ) : (
                      <div className={`w-full py-4 border rounded-xl text-[10px] font-black uppercase tracking-widest text-center mt-auto cursor-not-allowed ${
                        app.status === 'COMPLETED' 
                          ? 'bg-green-500/5 border-green-500/20 text-green-400'
                          : 'bg-neutral-900/20 border-neutral-800/50 text-neutral-600'
                      }`}>
                         {app.status === 'COMPLETED' ? '✓ Vehículo Listo para Recoger' : app.status === 'CANCELLED' ? 'Cita Cancelada' : 'Cita en Proceso'}
                      </div>
                   )}
               </div>
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
