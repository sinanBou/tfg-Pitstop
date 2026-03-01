import { useState, useEffect } from 'react';
import { 
  type VehicleDTO, 
  type AppointmentRequest, 
  type WorkshopMinDTO 
} from '../../../../types/client';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: VehicleDTO[];
  workshops: WorkshopMinDTO[];
  onSubmit: (data: AppointmentRequest) => Promise<boolean>;
  fetchSlots: (workshopId: string, date: string) => Promise<string[]>;
}

export const AppointmentModal = ({ 
  isOpen, 
  onClose, 
  vehicles, 
  workshops, 
  onSubmit, 
  fetchSlots 
}: AppointmentModalProps) => {
  const [step, setStep] = useState(1);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  
  const [formData, setFormData] = useState<AppointmentRequest>({
    vehicleId: '',
    workshopId: '',
    date: '',
    time: '',
    serviceType: '',
    description: ''
  });

  useEffect(() => {
    if (formData.workshopId && formData.date && step === 3) {
      console.log("Consultando taller:", formData.workshopId, "para la fecha:", formData.date);
      const loadSlots = async () => {
        setIsLoadingSlots(true);
        try {
          const slots = await fetchSlots(formData.workshopId, formData.date);
          console.log("Slots encontrados:", slots);
          setAvailableSlots(slots);
        } catch (err) {
          console.error("Error en fetchSlots:", err);
        } finally {
          setIsLoadingSlots(false);
        }
      };
      loadSlots();
    }
  }, [formData.date, formData.workshopId, step, fetchSlots]);

  if (!isOpen) return null;

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleFinish = async () => {
    const success = await onSubmit(formData);
    if (success) {
      setStep(1);
      setAvailableSlots([]);
      setFormData({
        vehicleId: '', workshopId: '', date: '', 
        time: '', serviceType: '', description: ''
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay con desenfoque */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Barra de progreso visual */}
        <div className="flex h-1.5 w-full bg-neutral-800">
          <div 
            className="bg-red-600 transition-all duration-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]" 
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="p-8">
          
          {/* PASO 1: SELECCIÓN DE VEHÍCULO */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <header className="mb-6">
                <h3 className="text-xl font-black uppercase italic text-white">Vehículo <span className="text-red-600">_</span></h3>
                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Paso 01/04</p>
              </header>
              <div className="grid gap-3">
                {vehicles.map(v => (
                  <button 
                    key={v.id}
                    onClick={() => { setFormData({...formData, vehicleId: v.id}); nextStep(); }}
                    className={`p-4 rounded-2xl border transition-all text-left group ${formData.vehicleId === v.id ? 'border-red-600 bg-red-600/10' : 'border-neutral-800 bg-black hover:border-neutral-600'}`}
                  >
                    <p className="text-white font-bold group-hover:text-red-500 transition-colors">{v.brand} {v.model}</p>
                    <p className="text-[10px] text-neutral-500 font-mono mt-1">{v.licensePlate}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PASO 2: SELECCIÓN DE TALLER */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <header className="mb-6">
                <h3 className="text-xl font-black uppercase italic text-white">Taller <span className="text-red-600">_</span></h3>
                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Paso 02/04</p>
              </header>
              <div className="grid gap-3">
                {workshops.map(w => (
                  <button 
                    key={w.id}
                    onClick={() => { setFormData({...formData, workshopId: w.id}); nextStep(); }}
                    className={`p-4 rounded-2xl border transition-all text-left ${
                      formData.workshopId === w.id ? 'border-red-600 bg-red-600/10' : 'border-neutral-800 bg-black hover:border-neutral-600'
                    }`}
                  >
                    {/* Muestra el nombre real del taller que viene del objeto 'w' */}
                    <p className="text-white font-bold uppercase">{w.companyName}</p>
                    
                  </button>
                ))}
              </div>
              <button onClick={prevStep} className="mt-6 text-neutral-500 text-[10px] font-black uppercase tracking-widest">← Volver</button>
            </div>
          )}

          {/* PASO 3: CALENDARIO Y DISPONIBILIDAD REAL */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <header className="mb-6">
                <h3 className="text-xl font-black uppercase italic text-white">
                  Agenda <span className="text-red-600">_</span>
                </h3>
                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Paso 03/04</p>
              </header>
              
              <div className="relative mb-6">
                <label className="text-[10px] uppercase font-bold text-neutral-500 ml-2 mb-1 block">
                  Selecciona el día
                </label>
                <input 
                  type="date" 
                  required
                  // Restricción para que no elijan fechas pasadas
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-white outline-none focus:border-red-600 transition-all appearance-none"
                  style={{ colorScheme: 'dark' }} // Esto fuerza al calendario nativo a ser oscuro
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value, time: ''})}
                />
              </div>

              {isLoadingSlots ? (
                <div className="py-10 text-center animate-pulse text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                  Sincronizando disponibilidad...
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.length > 0 ? (
                    availableSlots.map(hora => (
                      <button
                        key={hora}
                        onClick={() => { setFormData({...formData, time: hora}); nextStep(); }}
                        className={`p-2 rounded-lg text-[10px] font-black border transition-all ${
                          formData.time === hora ? 'border-green-500 bg-green-500/20 text-green-500' : 'border-neutral-800 bg-black text-neutral-400 hover:border-green-500'
                        }`}
                      >
                        {hora}
                      </button>
                    ))
                  ) : (
                    <div className="col-span-4 py-8 text-center border border-dashed border-neutral-800 rounded-2xl">
                      <p className="text-red-500/50 text-[10px] font-black uppercase">Sin huecos disponibles</p>
                    </div>
                  )}
                </div>
              )}
              <button onClick={prevStep} className="mt-6 text-neutral-500 text-[10px] font-black uppercase tracking-widest border rounded-2xl p-1 border-neutral-500 hover:border-neutral-400 transition-colors">← Volver</button>
            </div>
          )}

          {/* PASO 4: DETALLES Y FINALIZACIÓN */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <header className="mb-6">
                <h3 className="text-xl font-black uppercase italic text-white">Servicio <span className="text-red-600">_</span></h3>
                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Paso 04/04</p>
              </header>
              
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Motivo (Ej: Cambio de aceite)"
                  className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-white text-sm outline-none focus:border-red-600"
                  onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                />
                <textarea 
                  placeholder="Descripción de la avería o mantenimiento..."
                  className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-white text-sm h-32 outline-none focus:border-red-600 resize-none"
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                <button 
                  onClick={handleFinish}
                  disabled={!formData.serviceType}
                  className="w-full py-4 bg-red-600 text-white font-black rounded-xl uppercase text-xs tracking-[0.2em] shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  Confirmar Cita
                </button>
              </div>
              <button onClick={prevStep} className="mt-6 text-neutral-500 text-[10px] font-black uppercase tracking-widest border rounded-2xl p-1 border-neutral-500 hover:border-neutral-400 transition-colors">← Volver</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};