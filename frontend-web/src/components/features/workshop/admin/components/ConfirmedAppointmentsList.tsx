import { useState, useMemo } from 'react';

interface ConfirmedAppointmentsListProps {
  appointments: any[];
  onDeleteAppointment: (id: string) => void;
}

export const ConfirmedAppointmentsList = ({ appointments, onDeleteAppointment }: ConfirmedAppointmentsListProps) => {
  const [confirmedSearch, setConfirmedSearch] = useState('');

  // All confirmed or in progress appointments (no date filter) with optional search
  const confirmedAppointments = useMemo(() => {
    const confirmed = appointments.filter((a: any) => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS');
    if (!confirmedSearch.trim()) return confirmed;
    
    const search = confirmedSearch.toLowerCase();
    return confirmed.filter((a: any) => 
      (a.vehicleDisplay && a.vehicleDisplay.toLowerCase().includes(search)) ||
      (a.serviceType && a.serviceType.toLowerCase().includes(search)) ||
      (a.description && a.description.toLowerCase().includes(search))
    );
  }, [appointments, confirmedSearch]);

  const handleDelete = (id: string) => {
    if (window.confirm("¿Deseas eliminar esta cita y todas las tareas relacionadas de forma permanente?")) {
      onDeleteAppointment(id);
    }
  };

  if (confirmedAppointments.length === 0 && !confirmedSearch.trim()) {
    return null; // Ocultar si no hay citas y no se está buscando
  }

  return (
    <div className="mt-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          Citas Confirmadas
          <span className="bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full text-[10px]">{confirmedAppointments.length}</span>
        </h3>
        
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Buscar por vehículo, servicio..."
            value={confirmedSearch}
            onChange={(e) => setConfirmedSearch(e.target.value)}
            className="w-full bg-black/50 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          <svg className="w-4 h-4 text-neutral-600 absolute right-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {confirmedAppointments.map((app: any) => (
          <div key={app.id} className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/20 flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-1">
                <div className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">{app.serviceType}</div>
                {app.status === 'IN_PROGRESS' && (
                  <span className="bg-blue-500/10 text-blue-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase border border-blue-500/20">En Curso</span>
                )}
              </div>
              <div className="text-lg font-black text-white">{app.vehicleDisplay}</div>
              <div className="text-neutral-400 text-xs font-mono mb-4">{new Date(app.dateTime).toLocaleDateString([], { day: '2-digit', month: '2-digit' })} {new Date(app.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} h</div>
            </div>
            
            <button 
              onClick={() => handleDelete(app.id)}
              className="w-full py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-colors border border-red-500/20 opacity-0 group-hover:opacity-100 mt-2"
            >
              Cancelar y Eliminar
            </button>
          </div>
        ))}
        {confirmedAppointments.length === 0 && confirmedSearch.trim() && (
          <div className="col-span-full py-8 text-center text-neutral-500 text-xs uppercase tracking-widest font-bold">
            No se encontraron citas confirmadas para "{confirmedSearch}".
          </div>
        )}
      </div>
    </div>
  );
};
