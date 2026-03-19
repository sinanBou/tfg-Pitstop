

import type { UserDTO } from '../../../../types/client';

interface ClientOverviewTabProps {
  vehicles: any[];
  appointments: any[];
  cocheEnTaller: any;
  userProfile?: UserDTO | null;
}

export function ClientOverviewTab({ vehicles, appointments, cocheEnTaller, userProfile }: ClientOverviewTabProps) {
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* SECTION: GREETING & PERSONAL INFO */}
      <div className="bg-neutral-900/40 border border-neutral-800 p-8 md:p-10 rounded-[2rem] relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[80px] -z-10 mix-blend-screen group-hover:bg-blue-600/20 transition-all duration-700 pointer-events-none"></div>
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
            <div>
               <p className="text-[10px] uppercase font-bold tracking-widest text-blue-500 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  Panel de Cliente
               </p>
               <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-neutral-500 mb-2">
                 Hola, {userProfile?.firstname || 'Conductor'}
               </h2>
               <p className="text-neutral-400 font-mono flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {userProfile?.email || 'Cargando perfil...'}
               </p>
            </div>
         </div>
      </div>

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
    </div>
  );
}
