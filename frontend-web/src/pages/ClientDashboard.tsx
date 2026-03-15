import { useState } from 'react';
import { useClientDashboard } from '../hooks/useClientDashboard';

import { VehicleCard } from '../components/dashboard/client/vehicle/VehicleCard';
import { VehicleModal } from '../components/dashboard/client/vehicle/VehicleModal';

import { AppointmentModal } from '../components/dashboard/client/appointments/AppoointmentModal';

// Iconos inline para el nuevo diseño (puedes extraerlos luego si quieres)
const CalendarIcon = () => (<svg className="w-8 h-8 text-neutral-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const HistoryIcon = () => (<svg className="w-8 h-8 text-neutral-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);

const SECCIONES = ['INICIO', 'VEHÍCULOS', 'CITAS', 'HISTORIAL'];

export default function ClientDashboard() {
  const { loading, vehicles, workshops, appointments, history, registerVehicle, createAppointment, getAvailableSlots, deleteAppointment,refresh } = useClientDashboard();
  const [activeTab, setActiveTab] = useState(0);

  
  // 2. Nuevo estado para abrir/cerrar modal del registro de vehiculo
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cocheEnTaller = vehicles.find((v) => v.status !== 'EN_CASA');

  const [isAppModalOpen, setIsAppModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white font-black tracking-widest animate-pulse uppercase text-xs">
          Sincronizando con el taller...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black relative selection:bg-blue-500/30 selection:text-white pb-24">    
      {/* Fondo Glow Animado Global */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10 mix-blend-screen animate-pulse pointer-events-none"></div>

      {/* Top Header Light */}
      <header className="px-6 py-6 md:px-12 md:py-8 flex justify-between items-center z-20 sticky top-0 bg-transparent">
        <div>
           <h2 className="text-[2rem] md:text-[2.5rem] font-black italic tracking-tighter uppercase text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">PitStop</h2>
           <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.3em] mt-1 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">Conductor</p>
        </div>
        <button 
           onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
           className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)] bg-neutral-900/50 border border-neutral-800"
           title="Cerrar Sesión"
        >
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </header>

      {/* --- CONTENT AREA --- */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto relative z-10 scrollbar-hide">
         
         <div className="max-w-5xl mx-auto space-y-12 animate-fade-in-up">
            
            <header className="flex justify-between items-end border-b border-neutral-800/60 pb-6 mb-8">
               <div>
                  <h1 className="text-3xl md:text-4xl font-black uppercase tracking-[0.15em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                     {SECCIONES[activeTab]}
                  </h1>
               </div>
            </header>

            {/* TAB CONTENT: INICIO */}
            {activeTab === 0 && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <h3 className="text-sm font-black text-neutral-500 uppercase tracking-widest">Vista General</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {vehicles.length > 0 ? (
                           <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-[2rem] relative overflow-hidden group hover:border-blue-500/40 transition-all duration-300 hover:shadow-2xl">
                              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-110 group-hover:-rotate-3 duration-500 pointer-events-none">
                                 <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 10h14l1.5 4H3.5L5 10zM5 14v4h2v-4m10 0v4h2v-4M8 10V8c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2" /></svg>
                              </div>
                              <div className="relative z-10 flex flex-col h-full">
                                 <h4 className="text-neutral-400 font-bold uppercase tracking-widest text-xs mb-4">Tu Garaje</h4>
                                 <p className="text-4xl font-black text-white leading-none mb-1">{vehicles.length}</p>
                                 <p className="text-[10px] font-mono text-blue-400 uppercase tracking-widest mt-auto">Vehículos Activos</p>
                              </div>
                           </div>
                        ) : (
                           <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-[2rem] relative overflow-hidden group transition-all duration-300">
                              <div className="relative z-10 flex flex-col items-center justify-center text-center h-full opacity-50">
                                 <p className="text-lg font-black text-white uppercase mb-1">Sin Actividad</p>
                                 <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Garaje vacío</p>
                              </div>
                           </div>
                        )}
                        <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-[2rem] relative overflow-hidden group hover:border-blue-500/40 transition-all duration-300 hover:shadow-2xl">
                           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-110 group-hover:-rotate-3 duration-500 pointer-events-none">
                              <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                           </div>
                           <div className="relative z-10 flex flex-col h-full">
                              <h4 className="text-neutral-400 font-bold uppercase tracking-widest text-xs mb-4">Citas</h4>
                              <p className="text-4xl font-black text-white leading-none mb-1">{appointments.length}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {cocheEnTaller && (
                     <div className="space-y-6">
                        <h3 className="text-sm font-black text-neutral-500 uppercase tracking-widest">En reparación</h3>
                        <div className="bg-gradient-to-br from-neutral-900/80 to-black border border-blue-900/50 p-6 md:p-8 rounded-[2rem] relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300 flex flex-col hover:shadow-2xl hover:-translate-y-1">
                           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-110 group-hover:-rotate-3 duration-500 pointer-events-none">
                              <svg className="w-32 h-32 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                           </div>
                           <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,rgba(59,130,246,0.05)_50%,transparent_100%)] group-hover:animate-[shimmer_2s_infinite] -skew-x-12 pointer-events-none"></div>

                           <div className="relative z-10 flex flex-col h-full gap-6">
                              <div className="flex justify-between items-start">
                                 <div>
                                    <div className="flex items-center gap-2 mb-3 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full inline-flex">
                                       <span className="relative flex h-2 w-2">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                        </span>
                                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">{cocheEnTaller.status.replace('_', ' ')}</p>
                                     </div>
                                     <h4 className="text-3xl lg:text-4xl text-white font-black uppercase leading-none mb-1">{cocheEnTaller.brand}</h4>
                                     <h5 className="text-lg lg:text-xl text-neutral-400 font-bold uppercase">{cocheEnTaller.model}</h5>
                                    <p className="text-neutral-500 text-xs font-mono mt-3 bg-black/50 inline-block px-3 py-1.5 rounded-lg border border-neutral-800 shadow-inner">{cocheEnTaller.licensePlate}</p>
                                 </div>
                              </div>
                              
                              <div className="mt-auto pt-6 border-t border-neutral-800/50">
                                 <div className="flex justify-between items-center mb-2">
                                     <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Progreso</span>
                                     <span className="text-[10px] font-mono text-blue-400">En Curso</span>
                                 </div>
                                 <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden shadow-inner border border-neutral-800/50">
                                    <div className="h-full bg-[linear-gradient(to_right,rgba(37,99,235,0.8),rgba(96,165,250,1))] w-2/3 rounded-full relative">
                                       <div className="absolute right-0 top-0 h-full w-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)] animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            )}

            {/* TAB CONTENT: VEHÍCULOS */}
            {activeTab === 1 && (
               <div>
                  <div className="flex justify-between items-center mb-8">
                     <p className="text-neutral-500 text-sm font-medium">Gestiona tu flota de vehículos</p>
                     <button 
                        onClick={() => setIsModalOpen(true)}
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
            )}

            {/* TAB CONTENT: CITAS */}
            {activeTab === 2 && (
               <div>
                  <div className="flex justify-between items-center mb-8">
                     <p className="text-neutral-500 text-sm font-medium">Solicita y gestiona tus revisiones</p>
                     <button 
                        onClick={() => setIsAppModalOpen(true)}
                        className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/30 font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.1)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] flex items-center gap-2"
                     >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        Nueva Cita
                     </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {appointments.length > 0 ? (
                        appointments.map((app) => (
                           <div key={app.id} className="bg-neutral-900/40 border border-neutral-800 p-6 md:p-8 rounded-[2rem] relative overflow-hidden group hover:border-blue-500/40 transition-all duration-300 flex flex-col hover:shadow-2xl hover:-translate-y-1">
                              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-110 group-hover:-rotate-3 duration-500 pointer-events-none">
                                 <svg className="w-32 h-32 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                              </div>
                              
                              <div className="relative z-10 flex-1">
                                 <div className="flex justify-between items-start mb-6">
                                     <div>
                                        <h4 className="text-2xl font-black text-white tracking-widest mb-1">{app.date}</h4>
                                        <p className="text-neutral-400 font-mono text-sm">{app.time}</p>
                                    </div>
                                    <span className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest ${app.status === 'CONFIRMADA' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                                       {app.status}
                                    </span>
                                 </div>
                                 <h5 className="text-xl text-blue-400 font-bold uppercase tracking-wider mb-6 leading-tight">{app.serviceType}</h5>
                                 
                                 <div className="space-y-3 mb-8 bg-black/30 p-5 rounded-2xl border border-white/5 shadow-inner">
                                    <div className="flex justify-between items-center text-sm">
                                       <span className="text-neutral-500 font-bold uppercase tracking-wider text-[10px]">Vehículo</span>
                                       <span className="text-white font-mono">{app.vehicleDisplay || app.vehiclePlate}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                       <span className="text-neutral-500 font-bold uppercase tracking-wider text-[10px]">Taller</span>
                                       <span className="text-white font-mono">{app.workshopName}</span>
                                    </div>
                                 </div>
                              </div>
                              
                              <button onClick={() => { if(window.confirm("¿Cancelar cita?")) deleteAppointment(app.id); }} className="w-full py-4 bg-neutral-800/50 border border-neutral-700/50 text-neutral-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gradient-to-r hover:from-red-600 hover:to-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm relative z-10 group/btn mt-auto overflow-hidden">
                                 <span className="flex items-center justify-center gap-2 relative z-10">
                                    Cancelar Cita
                                    <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                 </span>
                              </button>
                           </div>
                        ))
                     ) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-40">
                           <CalendarIcon />
                           <p className="text-neutral-500 font-black uppercase tracking-widest mt-4">Sin citas programadas</p>
                        </div>
                     )}
                  </div>
               </div>
            )}

            {/* TAB CONTENT: HISTORIAL */}
            {activeTab === 3 && (
               <div className="max-w-3xl">
                  <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-800 before:to-transparent">
                     {history.length > 0 ? (
                        history.map(hist => (
                           <div key={hist.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-black bg-neutral-600 group-hover:bg-blue-500 text-neutral-500 group-hover:text-blue-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute top-0 left-[-27px] md:relative md:top-auto md:left-auto md:mx-auto transition-colors duration-300"></div>
                              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800 group-hover:border-blue-900/50 transition-colors shadow">
                                 <div className="flex items-center justify-between mb-2">
                                     <div className="font-bold text-white">{hist.vehicleName}</div>
                                     <time className="font-mono text-xs font-bold text-neutral-500">{hist.finishDate}</time>
                                 </div>
                                 <div className="text-neutral-400 text-sm">{hist.description}</div>
                              </div>
                           </div>
                        ))
                     ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
                           <HistoryIcon />
                           <p className="text-xs font-black uppercase tracking-[0.4em] text-neutral-500 font-mono mt-4">Log Vacío</p>
                        </div>
                     )}
                  </div>
               </div>
            )}
         </div>
      </main>

      {/* --- FLOATING BOTTOM NAV --- */}
      <nav className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 bg-neutral-950/90 backdrop-blur-xl border border-blue-900/30 p-2 rounded-[2rem] flex gap-1 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50">
        {SECCIONES.map((seccion, index) => (
          <button
            key={seccion}
            onClick={() => setActiveTab(index)}
            className={`px-4 md:px-6 py-3.5 md:py-4 rounded-3xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative overflow-hidden flex items-center justify-center ${
              activeTab === index 
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-100' 
                : 'text-neutral-500 hover:text-white hover:bg-neutral-800/50 scale-95 hover:scale-100'
            }`}
          >
            {activeTab === index && <div className="absolute inset-0 bg-white/20 blur-sm mix-blend-overlay"></div>}
            <span className="relative z-10">{seccion}</span>
          </button>
        ))}
      </nav>

      <VehicleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={registerVehicle!} 
      />
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
  );
}