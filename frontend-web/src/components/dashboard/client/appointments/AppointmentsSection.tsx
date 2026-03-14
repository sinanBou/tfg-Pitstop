// Interfaz para la Cita (Sincronizada con lo que vendrá del Backend)
interface AppointmentDTO {
  id: string;
  date: string; // ISO String
  time: string;
  serviceType: string;
  description: string;
  status: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA';
  vehiclePlate: string;
}

interface AppointmentSectionProps {
  appointments: AppointmentDTO[];
}

export const AppointmentSection = ({ appointments }: AppointmentSectionProps) => {
  return (
    <section className="w-1/4 h-full p-6 overflow-y-auto pb-32 space-y-4">

      <div className="space-y-3">
        {appointments.map((app) => (
          <div key={app.id} className="p-4 bg-neutral-900/40 rounded-2xl border border-neutral-800 flex justify-between items-center group hover:border-red-500/30 transition-colors">
            <div>
              <p className="text-blue-500 font-mono text-[10px] font-black">{app.date} - {app.time}</p>
              <h4 className="font-bold text-sm uppercase italic text-white">{app.serviceType}</h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase">{app.vehiclePlate}</p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                app.status === 'CONFIRMADA' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
              }`}>
                {app.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};