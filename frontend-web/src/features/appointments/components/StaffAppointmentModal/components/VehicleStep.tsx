import React from 'react';
import { SearchableSelect } from '@/components/common/SearchableSelect/index';
import { type ClientSearchDTO, type VehicleSearchDTO, type VehicleRequest } from '@/types/client';

const POPULAR_BRANDS = [
  "AUDI", "BMW", "CITROEN", "FORD", "HYUNDAI", "KIA", 
  "MERCEDES-BENZ", "NISSAN", "OPEL", "PEUGEOT", "RENAULT", 
  "SEAT", "TOYOTA", "VOLKSWAGEN"
];

interface VehicleStepProps {
  selectedClient: ClientSearchDTO | null;
  searchResults: { vehicles: VehicleSearchDTO[] };
  onSelectVehicle: (v: VehicleSearchDTO) => void;
  isNewVehicle: boolean;
  setIsNewVehicle: (b: boolean) => void;
  vehicleForm: VehicleRequest;
  setVehicleForm: (f: any) => void;
  makes: string[];
  models: string[];
  onCreateVehicle: () => void;
  loading: boolean;
  onPrev: () => void;
}

export const VehicleStep: React.FC<VehicleStepProps> = ({
  selectedClient, searchResults, onSelectVehicle, isNewVehicle, setIsNewVehicle,
  vehicleForm, setVehicleForm, makes, models, onCreateVehicle, loading, onPrev
}) => {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-600/10 border border-blue-600/20 rounded-2xl flex items-center gap-4">
        <div className="shrink-0 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black">
          {selectedClient?.firstname.charAt(0)}
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1">Cliente Seleccionado</p>
          <p className="text-white font-black uppercase text-sm">{selectedClient?.firstname} {selectedClient?.lastname}</p>
        </div>
        <button onClick={onPrev} className="text-neutral-500 hover:text-white transition-colors">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        </button>
      </div>

      <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
        {searchResults.vehicles.length > 0 && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-3 ml-2 italic">Vehículos Asociados</p>
            {searchResults.vehicles.map(v => (
              <button key={v.id} onClick={() => onSelectVehicle(v)} className="w-full p-5 bg-neutral-900/40 hover:bg-neutral-800/60 border border-neutral-800 rounded-2xl flex items-center justify-between mb-2 group transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600/10 text-blue-500 rounded-xl flex items-center justify-center font-black">{v.licensePlate.charAt(0)}</div>
                  <div className="text-left">
                    <p className="text-white font-black uppercase text-sm group-hover:text-blue-500 transition-colors">{v.licensePlate}</p>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase">{v.brand} {v.model}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="p-8 text-center bg-neutral-900/20 border border-dashed border-neutral-800 rounded-[2rem] hover:bg-neutral-900/40 transition-all">
            <p className="text-neutral-500 text-xs font-black uppercase tracking-widest mb-4 italic">¿Es un vehículo nuevo?</p>
            <button onClick={() => setIsNewVehicle(true)} className="px-6 py-3 bg-white text-black font-black uppercase text-[10px] rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95 flex items-center gap-2 mx-auto">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Añadir Nuevo Vehículo
            </button>
        </div>
      </div>

      {isNewVehicle && (
        <div className="p-8 bg-neutral-950 border border-neutral-800 rounded-[2rem] space-y-4 animate-in slide-in-from-bottom-4 duration-300">
           <h3 className="text-white font-black uppercase text-sm mb-6 flex items-center gap-2 italic">Registro de Vehículo</h3>
           <div className="grid grid-cols-2 gap-4">
              <SearchableSelect 
                label="Marca" 
                options={makes} 
                value={vehicleForm.brand} 
                onChange={v => setVehicleForm({...vehicleForm, brand: v, model: ''})} 
                placeholder="-- Seleccione --" 
                popularOptions={POPULAR_BRANDS}
              />
              <SearchableSelect 
                label="Modelo" 
                options={models} 
                value={vehicleForm.model} 
                onChange={v => setVehicleForm({...vehicleForm, model: v})} 
                placeholder="-- Seleccione --" 
                disabled={!vehicleForm.brand}
              />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <input placeholder="Matrícula" className="bg-black/40 border border-neutral-800 p-5 rounded-2xl text-white text-xs outline-none focus:border-blue-600 transition-all font-bold uppercase" value={vehicleForm.licensePlate} onChange={e => setVehicleForm({...vehicleForm, licensePlate: e.target.value.toUpperCase()})} />
              <input placeholder="VIN/Bastidor" className="bg-black/40 border border-neutral-800 p-5 rounded-2xl text-white text-xs outline-none focus:border-blue-600 transition-all font-bold uppercase" value={vehicleForm.vin} onChange={e => setVehicleForm({...vehicleForm, vin: e.target.value.toUpperCase()})} />
           </div>
           <button onClick={onCreateVehicle} disabled={loading || !vehicleForm.licensePlate || !vehicleForm.brand || !vehicleForm.model} className="w-full py-5 bg-blue-600 text-white font-black uppercase text-xs rounded-2xl hover:bg-blue-500 transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] disabled:opacity-50 active:scale-95">
             {loading ? 'Vinculando...' : 'Asociar Vehículo al Cliente'}
           </button>
        </div>
      )}
    </div>
  );
};
