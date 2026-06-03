import React from 'react';
import type { VehicleDTO } from '@/types/client';
import { Car } from '@/assets/icons';

interface VehicleStepProps {
  vehicles: VehicleDTO[];
  selectedVehicleId: string;
  onSelect: (vehicleId: string) => void;
}

export const VehicleStep: React.FC<VehicleStepProps> = ({
  vehicles,
  selectedVehicleId,
  onSelect
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex-1">
      <div className="grid gap-3">
        {vehicles.length > 0 ? vehicles.map(v => (
          <button 
            key={v.id}
            type="button"
            onClick={() => onSelect(v.id)}
            className={`relative p-5 rounded-2xl border transition-all text-left group overflow-hidden ${selectedVehicleId === v.id ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'border-neutral-800 bg-black/40 hover:border-blue-500/50 hover:bg-neutral-900/60'}`}
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className={`p-3 rounded-xl transition-colors ${selectedVehicleId === v.id ? 'bg-blue-500/20 text-blue-400' : 'bg-neutral-800 text-neutral-400 group-hover:text-blue-400'}`}>
                 <Car className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-lg text-white font-black tracking-wide group-hover:text-blue-400 transition-colors uppercase">{v.brand} {v.model}</p>
                <p className="text-xs text-neutral-500 font-mono mt-0.5 flex items-center gap-2">
                  Matrícula: <span className="text-neutral-300 bg-neutral-800/50 px-2 rounded-md py-0.5">{v.licensePlate}</span>
                </p>
              </div>
            </div>
          </button>
        )) : (
          <div className="py-12 text-center border-2 border-dashed border-neutral-800 rounded-3xl bg-neutral-900/20">
            <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest">No hay vehículos registrados.</p>
          </div>
        )}
      </div>
    </div>
  );
};
