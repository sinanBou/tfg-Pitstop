import React from 'react';
import { VehicleCard } from '../vehicle/VehicleCard';

interface ClientVehiclesTabProps {
  vehicles: any[];
  onAddVehicle: () => void;
}

export function ClientVehiclesTab({ vehicles, onAddVehicle }: ClientVehiclesTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
         <p className="text-neutral-500 text-sm font-medium">Gestiona tu flota de vehículos</p>
         <button 
            onClick={onAddVehicle}
            className="bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-500/30 font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.1)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center gap-2"
         >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Añadir Vehículo
         </button>
      </div>

      {vehicles.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v, index) => (
               <div key={v.id} className="relative group">
                  <VehicleCard brand={`${v.brand} ${v.model}`} plate={v.licensePlate} index={index} />
               </div>
            ))}
         </div>
      ) : (
         <div className="py-20 flex flex-col items-center justify-center opacity-40">
            <svg className="w-8 h-8 text-neutral-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10h14l1.5 4H3.5L5 10zM5 14v4h2v-4m10 0v4h2v-4M8 10V8c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2" /></svg>
            <p className="text-neutral-500 font-black uppercase tracking-widest mt-4">Todavía no tiene vehículos</p>
         </div>
      )}
    </div>
  );
}
