import { useState, useMemo } from 'react';

interface ConfirmedAppointmentsListProps {
  appointments: any[];
  onDeleteAppointment: (id: string) => void;
  onCheckInAppointment?: (id: string, kilometers: number, notes: string) => Promise<boolean>;
}

export const ConfirmedAppointmentsList = ({ 
  appointments, 
  onDeleteAppointment,
  onCheckInAppointment
}: ConfirmedAppointmentsListProps) => {
  const [confirmedSearch, setConfirmedSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [kilometers, setKilometers] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // All confirmed or in progress appointments with optional search
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

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !onCheckInAppointment) return;

    const kmNum = parseInt(kilometers, 10);
    if (isNaN(kmNum) || kmNum < 0) {
      alert("Por favor, introduce un número de kilómetros válido.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onCheckInAppointment(selectedAppId, kmNum, notes);
      if (success) {
        setIsModalOpen(false);
        setSelectedAppId(null);
        setKilometers('');
        setNotes('');
      } else {
        alert("Ocurrió un error al procesar la recepción.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAppointmentDetails = useMemo(() => {
    return appointments.find(a => a.id === selectedAppId);
  }, [appointments, selectedAppId]);

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
          <div key={app.id} className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/20 flex flex-col justify-between group relative overflow-hidden">
            <div>
              <div className="flex justify-between items-start mb-1">
                <div className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">{app.serviceType}</div>
                <div className="flex items-center gap-1.5">
                  {app.status === 'IN_PROGRESS' && (
                    <span className="bg-blue-500/10 text-blue-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase border border-blue-500/20">En Curso</span>
                  )}
                  {app.vehicleReceived && (
                    <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase border border-emerald-500/20">En Taller</span>
                  )}
                </div>
              </div>
              <div className="text-lg font-black text-white">{app.vehicleDisplay}</div>
              {app.clientFullName && (
                <div className="text-neutral-400 text-xs font-bold mt-0.5">Cliente: <span className="text-neutral-200">{app.clientFullName}</span></div>
              )}
              <div className="text-neutral-400 text-xs font-mono mt-2 mb-2">
                {new Date(app.dateTime).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}{' '}
                {new Date(app.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}{' '}
                h
              </div>

              {/* Información de Recepción */}
              {app.vehicleReceived ? (
                <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-[9px] uppercase tracking-widest">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    Vehículo Recibido
                  </div>
                  {app.receptionKilometers !== null && (
                    <div className="text-[11px] font-bold text-neutral-300">
                      Kilómetros: <span className="font-mono text-white bg-black/30 px-1.5 py-0.5 rounded">{app.receptionKilometers.toLocaleString()} Km</span>
                    </div>
                  )}
                  {app.receptionNotes && (
                    <div className="text-[11px] text-neutral-400 font-medium leading-relaxed italic border-t border-emerald-500/10 pt-1.5 mt-1.5">
                      "{app.receptionNotes}"
                    </div>
                  )}
                </div>
              ) : (
                onCheckInAppointment && (
                  <button
                    onClick={() => {
                      setSelectedAppId(app.id);
                      setKilometers('');
                      setNotes('');
                      setIsModalOpen(true);
                    }}
                    className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border border-emerald-500/20 flex items-center justify-center gap-1.5 mt-4"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Recepcionar Vehículo
                  </button>
                )
              )}
            </div>
            
            <button 
              onClick={() => handleDelete(app.id)}
              className="w-full py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-colors border border-red-500/20 opacity-0 group-hover:opacity-100 mt-4"
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

      {/* Glassmorphism Reception Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-8 rounded-[2rem] max-w-md w-full shadow-2xl relative animate-scale-in">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white mb-2 flex items-center gap-2">
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              Recepcionar Vehículo
            </h2>
            {selectedAppointmentDetails && (
              <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-6">
                Coche: <span className="text-white">{selectedAppointmentDetails.vehicleDisplay}</span>
              </p>
            )}

            <form onSubmit={handleCheckInSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-2">Kilómetros actuales *</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={kilometers}
                    onChange={(e) => setKilometers(e.target.value)}
                    placeholder="Ej: 142000"
                    className="w-full bg-black/40 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-700 focus:outline-none transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black uppercase text-neutral-600">Km</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-2">Notas de recepción (Estado, desperfectos...)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Desperfecto leve en el parachoques delantero izquierdo. Viene con rueda de repuesto puesta..."
                  rows={4}
                  className="w-full bg-black/40 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-700 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedAppId(null);
                  }}
                  className="w-1/2 py-3 bg-neutral-800/50 hover:bg-neutral-850 text-neutral-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  ) : (
                    'Confirmar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
