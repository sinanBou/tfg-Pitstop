
import { VehicleCard } from '../../common/Card/index';

interface ClientVehiclesTabProps {
  vehicles: any[];
  onAddVehicle: () => void;
  onDeleteVehicle: (id: string) => void;
}

export function ClientVehiclesTab({ vehicles, onAddVehicle, onDeleteVehicle }: ClientVehiclesTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-10 animate-fade-in">
         <div>
            <h2 className="text-2xl font-black text-white italic uppercase tracking-widest">Mi Garaje</h2>
            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Gestiona tu flota de vehículos activa</p>
         </div>
         <button 
            onClick={onAddVehicle}
            className="group bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-500/30 font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-2xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.1)] hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] flex items-center gap-2 active:scale-95"
         >
            <svg className="w-4 h-4 transform group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
            Añadir Nuevo Vehículo
         </button>
      </div>

      {vehicles.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((v, index) => (
               <VehicleCard 
                  key={v.id} 
                  brand={`${v.brand} ${v.model}`} 
                  plate={v.licensePlate} 
                  index={index} 
                  variant="blue"
                  onDelete={() => {
                     if (window.confirm(`¿Estás seguro de que deseas eliminar tu ${v.brand} ${v.model}? Esta acción también eliminará de forma permanente todas sus citas y tareas asociadas.`)) {
                        onDeleteVehicle(v.id);
                     }
                  }}
               />
            ))}
         </div>
      ) : (
         <div className="py-32 flex flex-col items-center justify-center bg-black/20 border border-dashed border-neutral-800 rounded-[3rem] animate-pulse">
            <svg className="w-16 h-16 text-neutral-800 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            <p className="text-neutral-600 font-black uppercase tracking-[0.3em] text-xs">Garaje Vacío</p>
         </div>
      )}
    </div>
  );
}
