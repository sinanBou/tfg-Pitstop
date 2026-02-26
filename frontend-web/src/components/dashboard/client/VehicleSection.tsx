import { VehicleCard } from './VehicleCard';

// Definimos la estructura del vehículo para esta sección
interface VehicleDTO {
  id: number;
  brand: string;
  model: string;
  licensePlate: string;
  status: string;
}

interface VehicleSectionProps {
  vehicles: VehicleDTO[];
  onRefresh: () => void;
}

export const VehicleSection = ({ vehicles, onRefresh }: VehicleSectionProps) => {
  return (
    <section className="w-1/4 h-full p-6 overflow-y-auto pb-32 space-y-3">
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-xs font-black text-gray-500 tracking-[0.2em] uppercase">
          Mis Vehículos ({vehicles.length})
        </h3>
      </div>

      <div className="space-y-3">
        {vehicles.length > 0 ? (
          vehicles.map((v, index) => (
            <VehicleCard 
              key={v.id}
              brand={`${v.brand} ${v.model}`} 
              plate={v.licensePlate} 
              index={index} 
            />
          ))
        ) : (
          <div className="py-10 text-center">
            <p className="text-neutral-700 font-black uppercase text-[10px] italic">
              No hay vehículos registrados
            </p>
          </div>
        )}
      </div>

      <button 
        onClick={onRefresh} // Podrías usarlo para refrescar manualmente
        className="w-full py-6 border-2 border-dashed border-neutral-800 rounded-2xl flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
      >
        <span className="text-gray-600 font-black text-sm tracking-widest group-hover:text-white">
          + REGISTRAR COCHE
        </span>
      </button>
    </section>
  );
};