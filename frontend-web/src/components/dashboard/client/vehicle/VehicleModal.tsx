import { useState } from 'react';
import { type VehicleRequest } from '../../../../types/client.ts';

// 1. Definimos una interfaz clara para las props del Modal
interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VehicleRequest) => Promise<boolean>;
}

export const VehicleModal = ({ isOpen, onClose, onSubmit }: VehicleModalProps) => {
  const [loading, setLoading] = useState(false);
  
  // 2. Inicializamos el estado asegurando que cumpla con el tipo VehicleRequest
  const [formData, setFormData] = useState<VehicleRequest>({
    brand: '',
    model: '',
    licensePlate: '',
    vin: '',
    year: new Date().getFullYear(),
    color: ''
  });

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

      {/* Contenedor del Modal */}
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Cabecera Neon */}
        <div className="bg-gradient-to-r from-blue-900/20 to-neutral-900 p-6 border-b border-neutral-800">
          <h3 className="text-xl font-black italic uppercase text-white">
            Nueva Unidad <span className="text-blue-500">_</span>
          </h3>
          <p className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase mt-1">
            Registro en base de datos
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-neutral-500 ml-2">Marca</label>
              <input 
                required
                type="text" 
                placeholder="Audi"
                className="w-full bg-black/50 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-700"
                value={formData.brand}
                onChange={e => setFormData({...formData, brand: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-neutral-500 ml-2">Modelo</label>
              <input 
                required
                type="text" 
                placeholder="A3 Sportback"
                className="w-full bg-black/50 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:border-blue-500 focus:outline-none transition-all placeholder:text-neutral-700"
                value={formData.model}
                onChange={e => setFormData({...formData, model: e.target.value})}
              />
            </div>
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

          <div className="pt-4 flex gap-3">
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