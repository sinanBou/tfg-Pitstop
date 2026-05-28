import { useState, useEffect } from 'react';
import { type VehicleDTO, type AppointmentRequest, type WorkshopMinDTO } from '@/types/client';
import { API_BASE_URL } from '@/config/api';
import { BaseModal } from '@/components/common/BaseModal/index';
import { ImagePreviewModal } from '@/components/common/ImagePreviewModal/index';
import { BackButton } from '@/components/common/Button/BackButton';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: VehicleDTO[];
  workshops: WorkshopMinDTO[];
  onSubmit: (data: AppointmentRequest) => Promise<boolean>;
  fetchSlots: (workshopId: string, date: string) => Promise<string[]>;
  existingAppointments?: any[];
}

export const AppointmentModal = ({ 
  isOpen, 
  onClose, 
  vehicles, 
  workshops, 
  onSubmit, 
  fetchSlots,
  existingAppointments = [] 
}: AppointmentModalProps) => {
  const [step, setStep] = useState(1);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  
  // Estado para el mes actual del calendario personalizado
  const [viewDate, setViewDate] = useState(new Date());
  
  const [formData, setFormData] = useState<AppointmentRequest>({
    vehicleId: '',
    workshopId: '',
    date: '',
    time: '',
    serviceType: '',
    description: ''
  });

  // ESTADOS PARA BÚSQUEDA PAGINADA
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<WorkshopMinDTO[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const checkDuplicate = (vId: string, wId: string) => {
    return (existingAppointments as any[]).some((app: any) => 
      app.vehicleId && app.workshopId &&
      String(app.vehicleId) === String(vId) && 
      String(app.workshopId) === String(wId) &&
      app.status !== 'CANCELLED'
    );
  };

  // EFECTO DE BÚSQUEDA CON DEBOUNCE
  useEffect(() => {
    if (step !== 2) return;

    const delayDebounceFn = setTimeout(() => {
      searchWorkshops(0, true);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, step]);

  const searchWorkshops = async (pageIdx: number, isNewSearch: boolean) => {
    setIsSearching(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(
        `${API_BASE_URL}/workshops/search?query=${encodeURIComponent(searchTerm)}&page=${pageIdx}&size=5`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (res.ok) {
        const data = await res.json();
        const newResults = data.content;
        setSearchResults(prev => isNewSearch ? newResults : [...prev, ...newResults]);
        setHasMore(!data.last);
        setCurrentPage(pageIdx);
      }
    } catch (err) {
      console.error("Error buscando talleres:", err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (formData.workshopId && formData.date && step === 3) {
      console.log("Consultando taller:", formData.workshopId, "para la fecha:", formData.date);

      // Verificamos si es un día laborable antes de hacer la petición
      const selectedWorkshop = workshops.find(w => w.id === formData.workshopId);
      if (selectedWorkshop && selectedWorkshop.workingDays) {
        const [year, month, day] = formData.date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
        const dayName = dias[dateObj.getDay()];
        if (!selectedWorkshop.workingDays.includes(dayName)) {
           setAvailableSlots([]);
           return;
        }
      }

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

  const nextStep = () => {
    setError(null);
    if (step === 2) {
      if (checkDuplicate(formData.vehicleId, formData.workshopId)) {
        setError("Ya tienes una cita asignada para este taller con este vehículo.");
        return;
      }
    }
    setStep(prev => prev + 1);
  };
  const prevStep = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  const handleFinish = async () => {
    setError(null);
    if (checkDuplicate(formData.vehicleId, formData.workshopId)) {
      setError("Ya tienes una cita asignada para este taller con este vehículo.");
      setStep(2);
      return;
    }
    const success = await onSubmit(formData);
    if (success) {
      setStep(1);
      setError(null);
      setAvailableSlots([]);
      setFormData({
        vehicleId: '', workshopId: '', date: '', 
        time: '', serviceType: '', description: ''
      });
      onClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva Cita"
      showDot={false}
      theme="blue"
      progressBarWidth={`${(step / 4) * 100}%`}
    >
      {error && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 shrink-0">
          <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <p className="text-xs text-blue-400 font-bold uppercase tracking-tight leading-tight">{error}</p>
        </div>
      )}

      {/* Contenido principal con animación para cada paso */}
      <div className="relative z-10 min-h-[300px] flex flex-col flex-1">
            
            {/* ENCABEZADOS DE PASOS COMUNES */}
            <div className="mb-8 flex items-center gap-4">
              {step > 1 && (
                <BackButton onClick={prevStep} title="Paso anterior" />
              )}
              <div>
                <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">{`Paso 0${step} / 04`}</p>
                <h3 className="text-2xl font-black uppercase text-white leading-none">
                  {step === 1 && "Tu Vehículo"}
                  {step === 2 && "El Taller"}
                  {step === 3 && "Horario"}
                  {step === 4 && "Servicio"}
                </h3>
              </div>
            </div>

            {/* PASO 1: SELECCIÓN DE VEHÍCULO */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex-1">
                <div className="grid gap-3">
                  {vehicles.length > 0 ? vehicles.map(v => (
                    <button 
                      key={v.id}
                      onClick={() => { setFormData({...formData, vehicleId: v.id}); nextStep(); }}
                      className={`relative p-5 rounded-2xl border transition-all text-left group overflow-hidden ${formData.vehicleId === v.id ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'border-neutral-800 bg-black/40 hover:border-blue-500/50 hover:bg-neutral-900/60'}`}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`p-3 rounded-xl transition-colors ${formData.vehicleId === v.id ? 'bg-blue-500/20 text-blue-400' : 'bg-neutral-800 text-neutral-400 group-hover:text-blue-400'}`}>
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10h14l1.5 4H3.5L5 10z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 14v4h2v-4m10 0v4h2v-4M8 10V8c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2" /></svg>
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
            )}

            {/* PASO 2: SELECCIÓN DE TALLER (CON PAGINACIÓN EN SERVIDOR) */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex-1 flex flex-col">
                {/* BARRA DE BÚSQUEDA */}
                <div className="relative mb-6">
                  <input 
                    type="text"
                    autoFocus
                    placeholder="Busca por nombre, CIF o dirección..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 pl-12 text-sm text-white focus:outline-none focus:border-blue-600/50 focus:bg-black transition-all placeholder-neutral-600"
                  />
                  <svg className="w-5 h-5 text-neutral-600 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>

                <div className="grid gap-3 flex-1 overflow-y-auto pr-1 max-h-[350px] custom-scrollbar scroll-smooth">
                  {searchResults.map(w => (
                    <button 
                      key={w.id}
                      onClick={() => { setFormData({...formData, workshopId: w.id}); nextStep(); }}
                      className={`p-5 rounded-2xl border transition-all text-left flex items-start gap-4 group ${
                        formData.workshopId === w.id ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'border-neutral-800 bg-black/40 hover:border-blue-500/50 hover:bg-neutral-900/60'
                      }`}
                    >
                      <div className={`w-12 h-12 shrink-0 rounded-xl overflow-hidden flex items-center justify-center transition-colors ${formData.workshopId === w.id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-neutral-800 text-neutral-400 group-hover:text-blue-400 border border-neutral-700/50'}`}>
                         {w.logoPictureUrl ? (
                            <img 
                               src={w.logoPictureUrl} 
                               alt="Logo" 
                               onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewUrl(w.logoPictureUrl!);
                                  setPreviewTitle(w.companyName);
                                  setPreviewOpen(true);
                                }}
                               className="w-full h-full object-cover cursor-zoom-in hover:scale-110 transition-transform duration-300"
                            />
                         ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                         )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                           <p className="text-lg text-white font-black uppercase tracking-wide group-hover:text-blue-400 transition-colors">{w.companyName}</p>
                           {w.cif && <span className="text-[9px] font-mono text-neutral-600 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">{w.cif}</span>}
                        </div>
                        {w.address && (
                           <p className="text-xs text-neutral-400 font-mono tracking-tight flex items-center gap-1.5 mb-2">
                             <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                             {w.address}
                           </p>
                        )}
                      </div>
                    </button>
                  ))}

                  {isSearching && (
                    <div className="py-8 flex flex-col items-center gap-2 opacity-50">
                       <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                       <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">Buscando...</p>
                    </div>
                  )}

                  {!isSearching && hasMore && searchResults.length > 0 && (
                    <button 
                      onClick={() => searchWorkshops(currentPage + 1, false)}
                      className="w-full py-4 bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-all shadow-sm"
                    >
                      Cargar más talleres
                    </button>
                  )}

                  {!isSearching && searchResults.length === 0 && (
                    <div className="py-12 text-center border-2 border-dashed border-neutral-800 rounded-3xl bg-neutral-900/20">
                       <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest animate-pulse">Sin resultados</p>
                    </div>
                  )}
                </div>

                
              </div>
            )}

            {/* PASO 3: CALENDARIO Y DISPONIBILIDAD REAL */}
            {step === 3 && (() => {
              const year = viewDate.getFullYear();
              const month = viewDate.getMonth();
              
              // Nombres de meses y días
              const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
              const daysOfWeek = ["L", "M", "X", "J", "V", "S", "D"];

              // Calcular días del mes
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const firstDayIndex = new Date(year, month, 1).getDay(); // 0 (Dom) a 6 (Sab)
              
              // Ajustar para que Lunes sea 0
              const startingDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

              const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
              const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const selectedWorkshop = workshops.find(w => w.id === formData.workshopId);

              return (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex-1 flex flex-col">
                  <div className="space-y-6 flex-1">
                    
                    <div className="flex flex-col md:flex-row gap-6 items-start flex-1">
                      
                      {/* CALENDARIO PERSONALIZADO (Izquierda) */}
                      <div className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-3xl w-full md:w-[450px] shrink-0">
                        <div className="flex items-center justify-between mb-4 px-2">
                          <h3 className="text-sm font-black uppercase tracking-widest text-white">
                            {monthNames[month]} <span className="text-blue-600">{year}</span>
                          </h3>
                          <div className="flex gap-1">
                            <button onClick={prevMonth} className="p-2 hover:bg-neutral-800 rounded-xl transition-colors text-neutral-400 hover:text-white">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button onClick={nextMonth} className="p-2 hover:bg-neutral-800 rounded-xl transition-colors text-neutral-400 hover:text-white">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-1">
                          {daysOfWeek.map(d => (
                            <div key={d} className="text-center text-[10px] font-black text-neutral-500 py-2">{d}</div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: startingDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                          ))}
                          {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dateObj = new Date(year, month, day);
                            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isSelected = formData.date === dateStr;
                            const isPast = dateObj < today;
                            
                            // Verificar si el taller abre este día
                            const dayName = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"][dateObj.getDay()];
                            const isClosedManual = selectedWorkshop?.workingDays && !selectedWorkshop.workingDays.includes(dayName);

                            return (
                              <button
                                key={day}
                                disabled={isPast}
                                onClick={() => setFormData({...formData, date: dateStr, time: ''})}
                                className={`
                                  aspect-square rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative group
                                  ${isPast ? 'text-neutral-700 cursor-not-allowed' : 
                                    isSelected ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 
                                    isClosedManual ? 'bg-neutral-900/30 text-neutral-600 hover:bg-neutral-800' :
                                    'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-blue-500/50 hover:text-white'}
                                `}
                              >
                                {day}
                                {isClosedManual && !isPast && !isSelected && (
                                  <div className="absolute bottom-1 w-1 h-1 bg-blue-500/40 rounded-full" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* HORAS DISPONIBLES (Derecha) */}
                      <div className="flex-1 w-full min-h-[250px] bg-neutral-900/30 border border-neutral-800/50 rounded-3xl p-6">
                        {!formData.date ? (
                          <div className="h-full flex flex-col items-center justify-center text-center py-12">
                            <svg className="w-12 h-12 text-neutral-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-neutral-500 text-xs font-black uppercase tracking-widest leading-relaxed">
                              Selecciona un día del calendario<br/>para ver las horas disponibles
                            </p>
                          </div>
                        ) : (
                          <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
                            {isLoadingSlots ? (
                              <div className="flex-1 flex flex-col items-center justify-center py-12 opacity-70">
                                 <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                 <p className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Sincronizando agenda...</p>
                              </div>
                            ) : (
                              <div className="flex-1 flex flex-col">
                                <label className="text-[10px] uppercase font-black tracking-widest text-neutral-500 block mb-4 ml-1">
                                  Horarios Disponibles para el {formData.date.split('-').reverse().join('/')}
                                </label>
                                <div className="grid grid-cols-3 gap-2.5 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                                  {availableSlots.length > 0 ? (
                                    availableSlots.map(hora => (
                                      <button
                                        key={hora}
                                        onClick={() => { setFormData({...formData, time: hora}); nextStep(); }}
                                        className={`p-3 rounded-xl text-sm font-mono font-bold transition-all relative overflow-hidden group ${
                                          formData.time === hora 
                                            ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-blue-500' 
                                            : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:border-blue-500/50 hover:bg-neutral-800 hover:text-white'
                                        }`}
                                      >
                                        {formData.time !== hora && <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors"></div>}
                                        <span className="relative z-10">{hora}</span>
                                      </button>
                                    ))
                                  ) : (
                                    (() => {
                                      let isClosed = false;
                                      if (formData.date && formData.workshopId) {
                                        const selectedWorkshop = workshops.find(w => w.id === formData.workshopId);
                                        if (selectedWorkshop && selectedWorkshop.workingDays) {
                                          const [year, month, day] = formData.date.split('-').map(Number);
                                          const dateObj = new Date(year, month - 1, day);
                                          const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
                                          const dayName = dias[dateObj.getDay()];
                                          if (!selectedWorkshop.workingDays.includes(dayName)) {
                                            isClosed = true;
                                          }
                                        }
                                      }

                                      return isClosed ? (
                                        <div className="col-span-3 py-12 text-center border border-dashed border-blue-900/50 bg-blue-900/10 rounded-2xl flex flex-col items-center justify-center gap-2">
                                          <svg className="w-8 h-8 text-blue-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                          <p className="text-blue-400/80 text-[10px] font-black uppercase tracking-widest">Taller cerrado este día</p>
                                        </div>
                                      ) : (
                                        <div className="col-span-3 py-12 text-center border border-dashed border-neutral-800 bg-neutral-900/30 rounded-2xl flex flex-col items-center justify-center gap-2">
                                          <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                          <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest">Sin huecos disponibles</p>
                                        </div>
                                      );
                                    })()
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  
                </div>
              )
            })()}

            {/* PASO 4: DETALLES Y FINALIZACIÓN */}
            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {/* Resumen Mini */}
                    <div className="bg-black/40 border border-neutral-800 rounded-xl p-3 flex flex-col justify-center">
                       <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1">Fecha Programada</p>
                       <p className="text-white text-sm font-bold truncate">
                         {formData.date ? formData.date.split('-').reverse().join('-') : ''} - {formData.time}h
                       </p>
                    </div>
                    <div className="bg-black/40 border border-neutral-800 rounded-xl p-3 flex flex-col justify-center">
                       <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1">Taller Seleccionado</p>
                       <p className="text-white text-sm font-bold truncate">{workshops.find(w => w.id === formData.workshopId)?.companyName || 'Taller'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-neutral-500 block mb-2 ml-1">
                      Asunto de la Cita
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ej: Mantenimiento anual, Revisión..."
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-4 text-white font-medium outline-none focus:border-blue-600 focus:bg-black transition-all placeholder-neutral-600"
                      onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-neutral-500 block mb-2 ml-1">
                      Detalles Adicionales (Opcional)
                    </label>
                    <textarea 
                      placeholder="Describe síntomas o notas para el mecánico..."
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-4 text-white text-sm outline-none focus:border-blue-600 focus:bg-black transition-all h-28 resize-none placeholder-neutral-600"
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end items-center bg-black/50 -mx-8 -mb-8 p-6 px-8 border-t border-neutral-800">
                   <button 
                    onClick={handleFinish}
                    disabled={!formData.serviceType}
                    className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-black rounded-xl uppercase tracking-widest shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:bg-blue-500 hover:shadow-[0_0_35px_rgba(59,130,246,0.6)] transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:hover:bg-blue-600 group"
                  >
                    Confirmar
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </button>
                </div>
              </div>
            )}
      </div>

      {previewOpen && (
        <ImagePreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          imageUrl={previewUrl}
          title={previewTitle}
        />
      )}
    </BaseModal>
  );
};