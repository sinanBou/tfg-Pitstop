// Interfaz para la Cita (Sincronizada con lo que vendrá del Backend)
interface AppointmentDTO {
  id: string;
  date: string; // ISO String
  time: string;
  serviceType: string;
  status: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA';
  vehiclePlate: string;
}

interface AppointmentSectionProps {
  appointments: AppointmentDTO[];
}

export const AppointmentSection = ({ appointments }: AppointmentSectionProps) => {
  return (
    <section className="w-1/4 h-full p-6 overflow-y-auto pb-32 space-y-4">

      {/* Botón de Acción Principal */}
      <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800 shadow-2xl">
        <h3 className="text-xl font-black mb-1 uppercase italic">¿Necesitas mantenimiento?</h3>
        <p className="text-gray-500 text-xs mb-4 uppercase font-bold">Reserva tu hueco en el taller ahora</p>
        <button className="w-full py-4 bg-red-600 text-white font-black rounded-xl uppercase text-sm hover:bg-red-700 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
          RESERVAR CITA _
        </button>
      </div>

      <div className="space-y-3">
        {appointments.length > 0 ? (
          appointments.map((app) => (
            <div key={app.id} className="p-4 bg-neutral-900/40 rounded-2xl border border-neutral-800 flex justify-between items-center group hover:border-blue-500/50 transition-colors">
              <div>
                <p className="text-blue-500 font-mono text-[10px] font-black">{app.date} - {app.time}</p>
                <h4 className="font-bold text-sm uppercase italic text-white">{app.serviceType}</h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase">{app.vehiclePlate}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                app.status === 'CONFIRMADA' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
              }`}>
                {app.status}
              </div>
            </div>
          ))
        ) : (
          <div className="pt-8 text-center">
            <p className="text-neutral-800 font-black uppercase tracking-[0.3em] text-[10px] italic">
              No hay citas próximas
            </p>
          </div>
        )}
      </div>
    </section>
  );
};