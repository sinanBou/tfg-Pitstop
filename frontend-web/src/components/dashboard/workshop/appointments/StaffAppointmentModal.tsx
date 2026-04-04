import { useState, useEffect } from 'react';
import { SearchableSelect } from '../../../common/SearchableSelect';
import { API_BASE_URL } from '../../../../config/api';
import { 
  type ClientSearchDTO, 
  type VehicleSearchDTO, 
  type VehicleRequest
} from '../../../../types/client';


interface StaffAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  workshopId: string;
  onSuccess: () => void;
  fetchMakes: () => Promise<string[]>;
  fetchModels: (make: string) => Promise<string[]>;
}

export function StaffAppointmentModal({ 
  isOpen, 
  onClose, 
  workshopId, 
  onSuccess,
  fetchMakes,
  fetchModels
}: StaffAppointmentModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{clients: ClientSearchDTO[], vehicles: VehicleSearchDTO[]}>({
    clients: [],
    vehicles: []
  });

  // Selection state
  const [selectedClient, setSelectedClient] = useState<ClientSearchDTO | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleSearchDTO | null>(null);

  // Form states
  const [isNewClient, setIsNewClient] = useState(false);
  const [clientForm, setClientForm] = useState({
    firstname: '',
    lastname: '',
    nif: '',
    phoneNumber: '',
    email: ''
  });

  const [isNewVehicle, setIsNewVehicle] = useState(false);
  const [vehicleForm, setVehicleForm] = useState<VehicleRequest>({
    brand: '',
    model: '',
    licensePlate: '',
    year: new Date().getFullYear(),
    vin: '',
    color: ''
  });

  const [appointmentForm, setAppointmentForm] = useState({
    date: '',
    time: '',
    serviceType: '',
    description: ''
  });

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [workshopSettings, setWorkshopSettings] = useState<any>(null);

  useEffect(() => {
    if (isOpen && workshopId) {
      const token = localStorage.getItem('jwt_token');
      fetch(`${API_BASE_URL}/workshops/${workshopId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setWorkshopSettings(data))
      .catch(err => console.error("Error fetching workshop settings:", err));
    }
  }, [isOpen, workshopId]);

  // Catalog state
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);

  useEffect(() => {
    if (isNewVehicle && makes.length === 0) {
      fetchMakes().then(setMakes);
    }
  }, [isNewVehicle]);

  useEffect(() => {
    if (vehicleForm.brand) {
      fetchModels(vehicleForm.brand).then(setModels);
    } else {
      setModels([]);
    }
  }, [vehicleForm.brand]);


  // Search Logic
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    const token = localStorage.getItem('jwt_token');
    try {
      // Búsqueda dual: clientes por NIF/Nombre y vehículos por matrícula
      const [cRes, vRes] = await Promise.all([
        fetch(`${API_BASE_URL}/clients/search?query=${searchQuery}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/vehicles/search?licensePlate=${searchQuery}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const clients = cRes.ok ? await cRes.json() : [];
      const vehicles = vRes.ok ? await vRes.json() : [];

      setSearchResults({ clients, vehicles });
      
      // Si hay un único resultado de vehículo, seleccionamos el cliente automáticamente
      if (vehicles.length === 1) {
        handleSelectVehicle(vehicles[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClient = async (client: ClientSearchDTO) => {
    setSelectedClient(client);
    setSearchQuery('');
    setSearchResults({ clients: [], vehicles: [] });
    
    // Al seleccionar cliente, buscamos sus vehículos
    const token = localStorage.getItem('jwt_token');
    const res = await fetch(`${API_BASE_URL}/vehicles/client/${client.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const vehicles = await res.json();
      setSearchResults(prev => ({ ...prev, vehicles }));
    }
    setStep(2);
  };

  const handleSelectVehicle = (vehicle: VehicleSearchDTO) => {
    setSelectedVehicle(vehicle);
    setStep(3);
  };

  const handleCreateClient = async () => {
    setLoading(true);
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`${API_BASE_URL}/clients/manual-register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientForm)
      });
      if (res.ok) {
        const client = await res.json();
        setSelectedClient(client);
        setStep(2);
      } else {
        const errorText = await res.text();
        alert("Error al crear cliente: " + errorText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVehicle = async () => {
    if (!selectedClient) return;
    setLoading(true);
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`${API_BASE_URL}/vehicles/register-for-client/${selectedClient.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vehicleForm)
      });
      if (res.ok) {
        const vehicle = await res.json();
        setSelectedVehicle(vehicle);
        setStep(3);
      } else {
        alert("Error al crear vehículo");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (date: string) => {
    const token = localStorage.getItem('jwt_token');
    const res = await fetch(`${API_BASE_URL}/appointments/availability/${workshopId}?date=${date}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setAvailableSlots(data.filter((s:any) => s.available).map((s:any) => s.time.slice(0,5)));
    }
  };

  const handleFinish = async () => {
    if (!selectedVehicle || !appointmentForm.date || !appointmentForm.time) return;
    setLoading(true);
    const token = localStorage.getItem('jwt_token');
    try {
      const [year, month, day] = appointmentForm.date.split('-');
      const dateTime = `${year}-${month}-${day}T${appointmentForm.time}:00`;

      const res = await fetch(`${API_BASE_URL}/appointments/staff`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workshopId,
          vehicleId: selectedVehicle.id,
          dateTime,
          serviceType: appointmentForm.serviceType,
          description: appointmentForm.description
        })
      });

      if (res.ok) {
        onSuccess();
        resetAndClose();
      } else {
        alert("Error al registrar la cita");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedClient(null);
    setSelectedVehicle(null);
    setSearchQuery('');
    setIsNewClient(false);
    setIsNewVehicle(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={resetAndClose} />
      
      <div className="relative bg-neutral-900 border border-neutral-800 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-neutral-800 flex justify-between items-center bg-black/20">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-white">Cita Presencial</h2>
            <p className="text-[10px] text-red-500 font-black uppercase mt-1 tracking-widest">Registro Manual de Turno</p>
          </div>
          <button onClick={resetAndClose} className="p-3 bg-neutral-800 text-neutral-400 hover:text-white rounded-2xl transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* STEPPER VISUAL */}
          <div className="flex items-center gap-4 mb-10">
            {[1, 2, 3].map(s => (
               <div key={s} className="flex items-center gap-2">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${step >= s ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-500'}`}>{s}</div>
                 <div className={`h-1 w-12 rounded-full transition-all ${step > s ? 'bg-red-600' : 'bg-neutral-800'}`}></div>
               </div>
            ))}
          </div>

          {/* STEP 1: CLIENT IDENTIFICATION */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-2">Buscar Cliente (NIF / Matrícula / Nombre)</label>
                <div className="flex gap-3">
                  <input 
                    autoFocus
                    placeholder="Escribe NIF o Matrícula..." 
                    className="flex-1 bg-black/40 border border-neutral-800 p-5 rounded-2xl text-white outline-none focus:border-red-600 transition-all font-mono"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                  <button onClick={handleSearch} disabled={loading} className="px-8 bg-red-600 text-white font-black uppercase text-xs rounded-2xl hover:bg-red-500 transition-all flex items-center gap-2">
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                    Buscar
                  </button>
                </div>
              </div>

              {/* SEARCH RESULTS */}
              {(searchResults.clients.length > 0 || searchResults.vehicles.length > 0) && (
                <div className="grid gap-4 bg-black/20 p-6 rounded-3xl border border-neutral-800">
                  {searchResults.clients.map(c => (
                    <button key={c.id} onClick={() => handleSelectClient(c)} className="flex items-center justify-between p-4 bg-neutral-800/50 hover:bg-neutral-800 rounded-2xl transition-all group">
                      <div className="text-left">
                        <p className="font-black text-white uppercase group-hover:text-red-500">{c.firstname} {c.lastname}</p>
                        <p className="text-[10px] text-neutral-500 font-mono uppercase">{c.nif} • {c.phoneNumber}</p>
                      </div>
                      <svg className="w-5 h-5 text-neutral-600 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  ))}
                  {searchResults.vehicles.map(v => (
                    <button key={v.id} onClick={() => handleSelectVehicle(v)} className="flex items-center justify-between p-4 bg-blue-600/10 border border-blue-600/20 hover:bg-blue-600/20 rounded-2xl transition-all group">
                      <div className="text-left">
                        <p className="font-black text-blue-500 uppercase">{v.licensePlate}</p>
                        <p className="text-[10px] text-neutral-400 font-mono uppercase">{v.brand} {v.model}</p>
                      </div>
                      <span className="text-[8px] font-black uppercase text-blue-600 bg-blue-600/10 px-2 py-1 rounded">Coche Encontrado</span>
                    </button>
                  ))}
                </div>
              )}

              {/* NEW CLIENT OPTION */}
              <div className="pt-4 flex flex-col gap-4">
                 <button onClick={() => setIsNewClient(!isNewClient)} className="w-full py-4 border-2 border-dashed border-neutral-800 text-neutral-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:border-red-600/50 hover:text-red-500 transition-all">
                    {isNewClient ? 'Cancelar Registro' : '+ Registrar Nuevo Cliente'}
                 </button>

                 {isNewClient && (
                    <div className="space-y-6 pt-4 animate-in slide-in-from-top-4">
                       <div className="grid grid-cols-2 gap-4">
                          <input placeholder="Nombre" className="bg-black/40 border border-neutral-800 p-4 rounded-xl text-white text-sm" value={clientForm.firstname} onChange={e => setClientForm({...clientForm, firstname: e.target.value})} />
                          <input placeholder="Apellidos" className="bg-black/40 border border-neutral-800 p-4 rounded-xl text-white text-sm" value={clientForm.lastname} onChange={e => setClientForm({...clientForm, lastname: e.target.value})} />
                          <input placeholder="NIF" className="bg-black/40 border border-neutral-800 p-4 rounded-xl text-white text-sm font-mono" value={clientForm.nif} onChange={e => setClientForm({...clientForm, nif: e.target.value.toUpperCase()})} />
                          <input placeholder="Teléfono" className="bg-black/40 border border-neutral-800 p-4 rounded-xl text-white text-sm font-mono" value={clientForm.phoneNumber} onChange={e => setClientForm({...clientForm, phoneNumber: e.target.value})} />
                          <input placeholder="Email (Opcional)" className="bg-black/40 border border-neutral-800 p-4 rounded-xl text-white text-sm col-span-2" value={clientForm.email} onChange={e => setClientForm({...clientForm, email: e.target.value})} />
                       </div>
                       <button onClick={handleCreateClient} disabled={!clientForm.nif} className="w-full py-4 bg-red-600 text-white font-black uppercase rounded-2xl shadow-xl hover:bg-red-500 transition-all">
                          Crear Ficha y Continuar
                       </button>
                    </div>
                 )}
              </div>
            </div>
          )}

          {/* STEP 2: VEHICLE SELECTION */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Cliente seleccionado</p>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="font-black text-white uppercase">{selectedClient?.firstname} {selectedClient?.lastname}</p>
                      <p className="text-[10px] text-neutral-500 font-mono uppercase">{selectedClient?.nif}</p>
                    </div>
                    <button onClick={() => setStep(1)} className="text-red-500 text-[10px] font-black uppercase hover:underline">Cambiar</button>
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-2">Seleccionar Vehículo</label>
                  {searchResults.vehicles.map(v => (
                    <button key={v.id} onClick={() => handleSelectVehicle(v)} className="w-full flex items-center justify-between p-6 bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/50 rounded-3xl transition-all group">
                       <div className="text-left flex items-center gap-6">
                         <div className="w-12 h-12 bg-black/40 rounded-2xl flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all">
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10h14l1.5 4H3.5L5 10z" /></svg>
                         </div>
                         <div>
                            <p className="font-black text-white uppercase italic text-lg">{v.brand} {v.model}</p>
                            <p className="text-xs text-neutral-400 font-mono">{v.licensePlate}</p>
                         </div>
                       </div>
                       <svg className="w-6 h-6 text-neutral-700 group-hover:text-red-500 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  ))}

                  <button onClick={() => setIsNewVehicle(!isNewVehicle)} className="w-full py-4 border-2 border-dashed border-neutral-800 text-neutral-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:border-red-600/50 hover:text-red-500 transition-all">
                    {isNewVehicle ? 'Cancelar Registro' : '+ Añadir Nuevo Vehículo'}
                  </button>

                  {isNewVehicle && (
                    <div className="space-y-6 pt-4 animate-in slide-in-from-top-4">
                      <div className="grid grid-cols-1 gap-4">
                        <SearchableSelect 
                          label="Marca"
                          value={vehicleForm.brand}
                          onChange={(val) => setVehicleForm({...vehicleForm, brand: val, model: ''})}
                          options={makes}
                          placeholder="Buscar marca..."
                        />
                        <SearchableSelect 
                          label="Modelo"
                          value={vehicleForm.model}
                          onChange={(val) => setVehicleForm({...vehicleForm, model: val})}
                          options={models}
                          placeholder="Selecciona modelo..."
                          disabled={!vehicleForm.brand}
                        />

                        <input placeholder="Matrícula" className="bg-black/40 border border-neutral-800 p-5 rounded-2xl text-white text-sm font-mono mt-2" value={vehicleForm.licensePlate} onChange={e => setVehicleForm({...vehicleForm, licensePlate: e.target.value.toUpperCase()})} />
                      </div>
                      <button onClick={handleCreateVehicle} disabled={!vehicleForm.licensePlate || !vehicleForm.brand} className="w-full py-5 bg-red-600 text-white font-black uppercase rounded-3xl shadow-xl hover:bg-red-500 transition-all">
                        Registrar Coche y Continuar
                      </button>
                    </div>
                  )}
               </div>
            </div>
          )}

          {/* STEP 3: APPOINTMENT DETAILS */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 text-left">
               <div className="p-4 bg-red-600/10 border border-red-600/20 rounded-2xl flex items-center gap-4">
                  <div className="shrink-0 w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center font-black">
                    {selectedVehicle?.licensePlate.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none mb-1">Coche Seleccionado</p>
                    <p className="text-white font-black uppercase text-sm">{selectedVehicle?.brand} {selectedVehicle?.model} • {selectedVehicle?.licensePlate}</p>
                  </div>
                  <button onClick={() => setStep(2)} className="text-neutral-500 hover:text-white transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
               </div>

               <div className="space-y-6">
                  {/* CALENDARIO PERSONALIZADO */}
                  {(() => {
                    const year = viewDate.getFullYear();
                    const month = viewDate.getMonth();
                    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                    const daysOfWeek = ["L", "M", "X", "J", "V", "S", "D"];
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const firstDayIndex = new Date(year, month, 1).getDay();
                    const startingDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
                    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
                    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    return (
                      <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-3xl">
                        <div className="flex items-center justify-between mb-6 px-2">
                          <h3 className="text-sm font-black uppercase tracking-widest text-white italic">
                            {monthNames[month]} <span className="text-red-600">{year}</span>
                          </h3>
                          <div className="flex gap-2">
                            <button onClick={prevMonth} className="p-2 hover:bg-neutral-800 rounded-xl transition-colors text-neutral-400 hover:text-white border border-transparent hover:border-neutral-700">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button onClick={nextMonth} className="p-2 hover:bg-neutral-800 rounded-xl transition-colors text-neutral-400 hover:text-white border border-transparent hover:border-neutral-700">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-7 gap-2 mb-2">
                          {daysOfWeek.map(d => (
                            <div key={d} className="text-center text-[10px] font-black text-neutral-500 py-2">{d}</div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                          {Array.from({ length: startingDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                          ))}
                          {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dateObj = new Date(year, month, day);
                            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isSelected = appointmentForm.date === dateStr;
                            const isPast = dateObj < today;

                            // Verificar si el taller abre este día
                            const diasNames = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
                            const dayName = diasNames[dateObj.getDay()];
                            
                            let isClosed = false;
                            if (workshopSettings?.workingDays) {
                               const workingDaysArr = workshopSettings.workingDays === 'LUNES-VIERNES' 
                                  ? ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']
                                  : workshopSettings.workingDays.split(',').map((d:string) => d.trim());
                               
                               if (!workingDaysArr.includes(dayName)) {
                                  isClosed = true;
                               }
                            }

                            return (
                              <button
                                key={day}
                                disabled={isPast || isClosed}
                                onClick={() => {
                                  setAppointmentForm({...appointmentForm, date: dateStr, time: ''});
                                  fetchSlots(dateStr);
                                }}
                                className={`
                                  aspect-square rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative group
                                  ${(isPast || isClosed) ? 'text-neutral-700 opacity-30 cursor-not-allowed' : 
                                    isSelected ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 
                                    'bg-neutral-800/50 border border-neutral-800 text-neutral-400 hover:border-red-500/50 hover:text-white'}
                                `}
                              >
                                {day}
                                {isClosed && !isPast && (
                                   <span className="absolute bottom-1 w-1 h-1 bg-red-500 rounded-full" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {appointmentForm.date && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                       <label className="text-[10px] uppercase font-black tracking-widest text-neutral-500 block mb-3 ml-2">Horas Disponibles</label>
                       <div className="grid grid-cols-4 gap-2">
                         {availableSlots.length > 0 ? (
                           availableSlots.map(s => (
                             <button
                               key={s}
                               onClick={() => setAppointmentForm({...appointmentForm, time: s})}
                               className={`py-3 rounded-xl text-xs font-bold font-mono transition-all border ${appointmentForm.time === s ? 'bg-red-600 text-white border-red-500' : 'bg-black/40 border-neutral-800 text-neutral-400 hover:border-red-500/50 hover:text-white'}`}
                             >
                               {s}h
                             </button>
                           ))
                         ) : (
                           <p className="col-span-4 text-center py-4 bg-red-600/5 border border-red-600/10 rounded-xl text-[10px] uppercase font-black text-red-500 tracking-widest italic">No hay huecos disponibles</p>
                         )}
                       </div>
                    </div>
                  )}
               </div>

               <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-2">Servicio</label>
                 <input placeholder="Ej: Revisión Pre-ITV" className="bg-black/40 border border-neutral-800 p-5 rounded-2xl text-white outline-none focus:border-red-600 transition-all font-bold placeholder:text-neutral-700" value={appointmentForm.serviceType} onChange={e => setAppointmentForm({...appointmentForm, serviceType: e.target.value})} />
               </div>

               <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-2">Descripción / Notas</label>
                 <textarea placeholder="Detalles extra del trabajo..." className="bg-black/40 border border-neutral-800 p-5 rounded-2xl text-white outline-none focus:border-red-600 min-h-[100px] resize-none transition-all placeholder:text-neutral-700" value={appointmentForm.description} onChange={e => setAppointmentForm({...appointmentForm, description: e.target.value})} />
               </div>

               <button onClick={handleFinish} disabled={!appointmentForm.time || !appointmentForm.serviceType || loading} className="w-full py-6 bg-red-600 text-white font-black uppercase rounded-[2rem] shadow-2xl hover:bg-red-500 transition-all active:scale-[0.98] disabled:opacity-50 mt-4">
                  {loading ? 'Procesando...' : 'Confirmar Cita Presencial'}
               </button>

            </div>
          )}

        </div>
        
        {/* Footer info */}
        <div className="p-6 bg-black/40 border-t border-neutral-800 text-center">
           <p className="text-[9px] text-neutral-600 font-black uppercase tracking-widest leading-none">PitStop Management System v1.2 • Registro Seguro de Citas</p>
        </div>

      </div>
    </div>
  );
}
