import { useState } from 'react';
import { useClientDashboard } from '../hooks/useClientDashboard';

// Mantenemos tus componentes de UI base
import FeatureCard from '../components/ui/FeatureCard';
import { VehicleCard } from '../components/dashboard/client/vehicle/VehicleCard';
import { VehicleModal } from '../components/dashboard/client/vehicle/VehicleModal';

import { AppointmentModal } from '../components/dashboard/client/appointments/AppoointmentModal';

// Iconos inline para el nuevo diseño (puedes extraerlos luego si quieres)
const GarageIcon = () => (<svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>);
const CalendarIcon = () => (<svg className="w-8 h-8 text-neutral-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const HistoryIcon = () => (<svg className="w-8 h-8 text-neutral-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const PlusCircleIcon = () => (<svg className="w-10 h-10 text-gray-600 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);

const SECCIONES = ['INICIO', 'VEHÍCULOS', 'CITAS', 'HISTORIAL'];

export default function ClientDashboard() {
  const { loading, vehicles, workshops, appointments, history, registerVehicle, createAppointment, getAvailableSlots, deleteAppointment,refresh } = useClientDashboard();
  const [activeTab, setActiveTab] = useState(0);

  
  // 2. Nuevo estado para abrir/cerrar modal del registro de vehiculo
  const [isModalOpen, setIsModalOpen] = useState(false);

  const desplazamiento = `-${activeTab * 25}%`;
  const cocheEnTaller = vehicles.find((v) => v.status !== 'EN_CASA');

  const [isAppModalOpen, setIsAppModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white font-black italic tracking-widest animate-pulse uppercase text-xs">
          Sincronizando con el taller...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col overflow-hidden font-sans bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-black to-black">    
      {/* --- HEADER (INTACTO) --- */}
      <header className=" mt-4 mx-6 p-6 bg-transparent z-10 flex justify-center items-start border border-white/10 rounded-full">
        <div>
          <h1 className="text-4xl  p-2 font-black uppercase tracking-tighter  text-transparent bg-clip-text bg-white">
            {SECCIONES[activeTab]}
          </h1>
        </div>

      </header>

      {/* --- SLIDER PRINCIPAL --- */}
      <main className="flex-1 relative overflow-hidden">
        <div 
          className="flex h-full w-[400%] transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{ transform: `translateX(${desplazamiento})` }}
        >
          
          {/* ================= SECCIÓN 0: HOME ================= */}
          <section className="w-1/4 h-full p-6 overflow-y-auto pb-32 space-y-6 scrollbar-hide">
             
             <div className="grid grid-cols-2 gap-4">
                {vehicles.length > 0 ? (
                  <FeatureCard 
                    title="TU GARAJE" 
                    description={`${vehicles.length} Activos`} 
                    borderColor="blue" 
                  />
                ) : (
                  <FeatureCard 
                    title="SIN ACTIVIDAD" 
                    description="Garaje vacío" 
                    borderColor="red" 
                  />
                )}
                {/* Placeholder para otra estadística futura */}
                <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/30 flex flex-col justify-between opacity-50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Próxima Revisión</p>
                    <p className="text-xl font-black italic text-neutral-300">---</p>
                </div>
             </div>

             {/* Widget de Estado del Taller Mejorado */}
             {cocheEnTaller && (
                <div className="relative overflow-hidden p-6 bg-gradient-to-br from-neutral-900 to-black rounded-3xl border border-blue-900/50 shadow-[0_0_30px_rgba(30,58,138,0.2)]">
                  {/* Efecto de línea de escaneo de fondo */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,rgba(59,130,246,0.1)_50%,transparent_100%)] animate-[shimmer_2s_infinite] -skew-x-12"></div>
                  
                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">Monitor de Taller</p>
                      </div>
                      <h3 className="text-xl text-white font-black italic uppercase">{cocheEnTaller.brand} {cocheEnTaller.model}</h3>
                      <p className="text-neutral-400 text-xs font-mono mt-1">{cocheEnTaller.licensePlate}</p>
                    </div>
                    <GarageIcon />
                  </div>
                  
                  <div className="mt-6 relative">
                    <div className="flex justify-between text-[10px] font-black uppercase text-neutral-500 mb-1">
                      <span>Estado:</span>
                      <span className="text-blue-300 animate-pulse">{cocheEnTaller.status.replace('_', ' ')}</span>
                    </div>
                    {/* Barra de progreso visual */}
                    <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 w-2/3 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.7)] relative">
                         <div className="absolute right-0 top-0 h-full w-4 bg-white/30 blur-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
             )}
          </section>

          {/* ================= SECCIÓN 1: VEHÍCULOS (REDITADA) ================= */}
          <section className="w-1/4 h-full p-6 overflow-y-auto pb-32 space-y-5 scrollbar-hide">
            {/* Decoración de fondo sutil */}
            <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full filter blur-[120px] -z-10"></div>

            <div className="space-y-4">
              {vehicles.length > 0 ? (
                vehicles.map((v, index) => (
                  // Mantenemos tu VehicleCard, pero podríamos envolverla si quisiéramos
                  <VehicleCard 
                    key={v.id} 
                    brand={`${v.brand} ${v.model}`} 
                    plate={v.licensePlate} 
                    index={index} 
                  />
                ))
              ) : (
                <div className="py-10 text-center border border-neutral-800 rounded-3xl bg-neutral-900/20 backdrop-blur-sm">
                  <p className="text-neutral-600 font-black uppercase text-xs tracking-widest italic">
                    Sin vehículos registrados
                  </p>
                </div>
              )}
            </div>
            
            {/* Botón de Registrar rediseñado como "Slot Vacío" */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="relative w-full h-32 rounded-3xl border-2 border-dashed border-neutral-800 bg-gradient-to-b from-black/60 to-neutral-900/60 backdrop-blur-md flex flex-col items-center justify-center overflow-hidden group transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(37,99,235,0.1)]"
            >
              {/* Efecto de luz al pasar el mouse */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/0 via-blue-600/0 to-blue-600/0 opacity-0 group-hover:opacity-10 group-hover:from-blue-600/10 transition-opacity duration-500"></div>
              
              <PlusCircleIcon />
              <span className="text-gray-600 font-black text-[10px] tracking-[0.3em] uppercase mt-3 group-hover:text-blue-400 transition-colors relative z-10">
                Registrar nuevo vehículo
              </span>
            </button>
          </section>

          {/* ================= SECCIÓN 2: CITAS (REDITADA) ================= */}
          <section className="w-1/4 h-full p-6 overflow-y-auto pb-32 space-y-6 scrollbar-hide">
            {/* Tarjeta CTA (Botón Nueva Cita) */}
            <div className="relative bg-gradient-to-br from-neutral-900 to-black p-6 rounded-3xl border border-neutral-800 overflow-hidden group hover:border-red-900/50 transition-colors">
              <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-1 uppercase text-white">PEDIR CITA</h3>
                <p className="text-neutral-400 text-md mb-6 font-mono">Inicie una nueva solicitud de servicio técnico.</p>
                <button 
                  onClick={() => setIsAppModalOpen(true)}
                  className="w-full py-4 bg-red-600/90 hover:bg-red-600 rounded-2xl text-white font-bold uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                >
                  NUEVA CITA
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-4 ml-2">Próximos Eventos</h4>
              {appointments.length > 0 ? (
                appointments.map((app) => (
                  <div key={app.id} 
                    className="relative p-5 bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden group hover:border-red-900/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.15)] transition-all duration-300"
                  >
                    {/* Efecto hover fondo */}
                    <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    
                    {/* Header Cita: Fecha, Hora, Estado */}
                    <div className="flex justify-between items-start mb-5 relative z-10">
                      <div className="flex items-center gap-3">
                        {/* Icono de Calendario decorativo */}
                        <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.15)] flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        
                        <div>
                          <div className="flex flex-col">
                            <h4 className="text-lg font-black text-white tracking-widest leading-none mb-1">
                              {app.date}
                            </h4>
                            <div className="flex items-center gap-1.5 text-neutral-400 mt-1">
                              <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              <span className="text-xs font-mono text-neutral-300">
                                {app.time}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm ${
                          app.status === 'CONFIRMADA' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                        }`}>
                          {app.status}
                        </span>
                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{app.serviceType}</p>
                      </div>
                    </div>

                    {/* Divisor */}
                    <div className="h-px w-full bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 my-4 relative z-10"></div>

                    {/* Info: Vehiculo y Taller */}
                    <div className="grid grid-cols-1 gap-3 relative z-10">
                      {(app.vehicleDisplay || app.vehiclePlate) && (
                        <div className="flex items-center gap-3 bg-black/40 p-3 rounded-2xl border border-neutral-800/50 group-hover:bg-black/60 transition-colors">
                          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10h14l1.5 4H3.5L5 10z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 14v4h2v-4m10 0v4h2v-4M8 10V8c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2" /></svg>
                          </div>
                          <div>
                            <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-0.5">Vehículo</p>
                            <p className="text-sm text-neutral-200 font-mono">
                              {app.vehicleDisplay || app.vehiclePlate}
                            </p>
                          </div>
                        </div>
                      )}

                      {app.workshopName && (
                        <div className="flex items-center gap-3 bg-black/40 p-3 rounded-2xl border border-neutral-800/50 group-hover:bg-black/60 transition-colors">
                          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                          </div>
                          <div>
                            <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-0.5">Taller</p>
                            <p className="text-sm text-neutral-200 font-mono">
                              {app.workshopName}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Botón Eliminar en la parte inferior */}
                    <div className="mt-5 flex justify-end relative z-10">
                        <button 
                          onClick={() => {
                            if(window.confirm("¿Cancelar esta cita?")) deleteAppointment(app.id);
                          }}
                          className="flex items-center gap-1.5 text-[10px] text-neutral-500 hover:text-red-500 uppercase font-black transition-all px-3 py-1.5 rounded-lg hover:bg-red-500/10 active:scale-95"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          Cancelar Cita
                        </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="pt-16 flex flex-col items-center justify-center opacity-40">
                  <CalendarIcon />
                  <p className="text-neutral-500 text-lg font-black uppercase tracking-[0.2em] text-[10px] font-mono">
                    No tienes citas programadas
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ================= SECCIÓN 3: HISTORIAL ================= */}
          <section className="w-1/4 h-full p-6 overflow-y-auto pb-32 space-y-4 scrollbar-hide relative">
             {/* Línea de tiempo de fondo */}
             <div className="absolute left-9 top-0 h-full w-px bg-neutral-800 z-0"></div>

             {history.length > 0 ? (
                history.map(hist => (
                  <div key={hist.id} className="relative z-10 flex items-start">
                    <div className="w-6 h-6 bg-black border-2 border-neutral-700 rounded-full flex-shrink-0 mt-1 ml-0.5 z-10 shadow-[0_0_0_4px_rgba(0,0,0,1)]"></div>
                    <div className="ml-6 p-5 bg-neutral-900/80 border border-neutral-800 rounded-2xl backdrop-blur-sm flex-1">
                       <p className="text-xs font-black text-neutral-400 mb-1">{hist.finishDate}</p>
                       <h5 className="font-bold text-white italic">{hist.vehicleName}</h5>
                       <p className="text-sm text-neutral-300 mt-2 font-mono">{hist.description}</p>
                    </div>
                  </div>
                ))
             ) : (
                <div className="h-[60vh] flex flex-col items-center justify-center opacity-30 z-10 relative">
                   <HistoryIcon />
                   <p className="text-xs font-black uppercase tracking-[0.4em] text-neutral-500 font-mono">LOG VACÍO</p>
                   <p className="text-[9px] text-neutral-600 mt-2 font-mono">/var/log/maintenance.log</p>
                </div>
             )}
          </section>

        </div>
      </main>

      {/* --- NAV FLOTANTE (INTACTO) --- */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 p-1.5 rounded-2xl flex gap-1 shadow-2xl z-50">
        {SECCIONES.map((seccion, index) => (
          <button
            key={seccion}
            onClick={() => setActiveTab(index)}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              activeTab === index 
                ? 'bg-white text-black shadow-lg scale-105' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            {seccion}
          </button>
        ))}
      </nav>
      <VehicleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={registerVehicle} // registerVehicle debe recibir (data: VehicleRequest)
      />
      <div className="min-h-screen ...">
      {/* ... */}
      <AppointmentModal 
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        vehicles={vehicles}
        workshops={workshops}
        onSubmit={async (data) => {
          const success = await createAppointment(data);
          if (success) {
            refresh(); 
          }
          return success;
        }}
        fetchSlots={getAvailableSlots}
      />
    </div>
    </div>
  );
}