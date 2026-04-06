import { useState, useEffect } from 'react';
import { type VehicleRequest } from '../../../../types/client.ts';
import { SearchableSelect } from '../../../common/SearchableSelect/index';

// 1. Definimos una interfaz clara para las props del Modal
interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VehicleRequest) => Promise<boolean>;
  fetchMakes: () => Promise<string[]>;
  fetchModels: (make: string) => Promise<string[]>;
}

export const VehicleModal = ({ isOpen, onClose, onSubmit, fetchMakes, fetchModels }: VehicleModalProps) => {
  const [loading, setLoading] = useState(false);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);

  // 2. Inicializamos el estado asegurando que cumpla con el tipo VehicleRequest
  const [formData, setFormData] = useState<VehicleRequest>({
    brand: '',
    model: '',
    licensePlate: '',
    vin: '',
    year: new Date().getFullYear(),
    color: ''
  });

  // Cargar marcas iniciales
  useEffect(() => {
    if (isOpen) {
      fetchMakes().then(setMakes);
    }
  }, [isOpen, fetchMakes]);

  // Cargar modelos cuando cambie la marca
  useEffect(() => {
    if (formData.brand) {
      fetchModels(formData.brand).then(setModels);
    } else {
      setModels([]);
    }
  }, [formData.brand, fetchModels]);


  // Si no está abierto, no renderizamos nada
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await onSubmit(formData);
      if (success) {
        // Opcional: Limpiar el formulario al tener éxito
        setFormData({
          brand: '', model: '', licensePlate: '', 
          vin: '', year: new Date().getFullYear(), color: ''
        });
        onClose();
      }
    } catch (error) {
      console.error("Error al registrar vehículo:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo oscuro con desenfoque */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="relative bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-300">
        
        {/* Cabecera del Modal */}
        <div className="relative p-6 px-8 border-b border-neutral-800/50 bg-neutral-950/50 flex justify-between items-center z-10">
          <div>
            <h2 className="text-white text-2xl font-black uppercase tracking-widest flex items-center gap-3">
              Nuevo Vehículo
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
            </h2>
            <p className="text-[10px] text-neutral-500 font-mono mt-1 uppercase">Añade a tu garaje</p>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Fondo decorativo interno */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <div className="absolute -top-[40%] -left-[40%] w-full h-full bg-blue-600/5 blur-[100px] rounded-full mix-blend-screen"></div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5 relative z-10">
          <div className="grid grid-cols-2 gap-4">
            <SearchableSelect 
              label="Marca" 
              placeholder="Seleccionar..." 
              options={makes} 
              value={formData.brand} 
              onChange={val => setFormData({...formData, brand: val, model: ''})} 
            />
            <SearchableSelect 
              label="Modelo" 
              placeholder="Seleccionar..." 
              options={models} 
              value={formData.model} 
              onChange={val => setFormData({...formData, model: val})} 
              disabled={!formData.brand}
            />
          </div>


          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-neutral-500 ml-2">Matrícula</label>
              <input 
                required
                type="text" 
                placeholder="0000XXX"
                className="w-full bg-black/50 border border-neutral-800 rounded-xl p-3 text-sm text-white font-mono tracking-wider focus:border-blue-500 focus:outline-none transition-all placeholder:text-neutral-700"
                value={formData.licensePlate}
                onChange={e => setFormData({...formData, licensePlate: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-neutral-500 ml-2">Año</label>
              <input 
                required
                type="number" 
                className="w-full bg-black/50 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:border-blue-500 focus:outline-none transition-all placeholder:text-neutral-700"
                value={formData.year}
                onChange={e => setFormData({...formData, year: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-2">VIN (Bastidor)</label>
            <input 
              type="text" 
              placeholder="Opcional"
              className="w-full bg-black/50 border border-neutral-800 rounded-xl p-3 text-xs text-white font-mono focus:border-blue-500 focus:outline-none transition-all placeholder:text-neutral-700"
              value={formData.vin}
              onChange={e => setFormData({...formData, vin: e.target.value.toUpperCase()})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-2">Color</label>
            <input 
              type="text" 
              placeholder="Ej: Negro Mate"
              className="w-full bg-black/50 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:border-blue-500 focus:outline-none transition-all placeholder:text-neutral-700"
              value={formData.color}
              onChange={e => setFormData({...formData, color: e.target.value})}
            />
          </div>

          <div className="pt-6 border-t border-neutral-800/50 mt-4 -mx-8 px-8 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-neutral-800 text-neutral-400 text-xs font-black uppercase hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-xs font-black uppercase hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Procesando...' : 'Confirmar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};