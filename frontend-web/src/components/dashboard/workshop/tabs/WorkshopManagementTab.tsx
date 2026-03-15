interface WorkshopManagementTabProps {
  workshops: any[];
  onAddWorkshop: () => void;
}

const WorkshopIcon = () => (
  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

export function WorkshopManagementTab({ workshops, onAddWorkshop }: WorkshopManagementTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
         <p className="text-neutral-500 text-sm font-medium">Gestión de sucursales activas</p>
         <button 
            onClick={onAddWorkshop}
            className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/30 font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.1)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] flex items-center gap-2"
         >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Nuevo Taller
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {workshops.map((workshop: any) => (
            <div key={workshop.id} className="bg-neutral-900/40 border border-neutral-800 p-6 md:p-8 rounded-[2rem] relative overflow-hidden group hover:border-red-500/40 transition-all duration-300 flex flex-col hover:shadow-2xl hover:-translate-y-1">
               <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-110 group-hover:-rotate-3 duration-500">
                  <svg className="w-32 h-32 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
               </div>
               
               <div className="relative z-10 flex-1">
                  <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-900/20 border border-red-500/20 text-red-500 flex items-center justify-center shadow-inner">
                         <WorkshopIcon />
                      </div>
                      <h3 className="text-xl font-black uppercase text-white leading-tight tracking-tighter flex-1">{workshop.companyName}</h3>
                  </div>
                  
                  <div className="space-y-3 mb-8 bg-black/30 p-5 rounded-2xl border border-white/5 shadow-inner">
                     <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-neutral-800/50 rounded-lg text-neutral-400 mt-0.5 shrink-0 border border-neutral-700/50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <p className="text-sm font-medium text-neutral-300 leading-snug">{workshop.address}</p>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-red-500/10 rounded-lg text-red-400 shrink-0 border border-red-500/20">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <p className="text-sm font-black text-red-400 font-mono tracking-widest">{workshop.cif}</p>
                     </div>
                  </div>
               </div>
               
               <button className="w-full py-4 bg-neutral-800/50 border border-neutral-700/50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gradient-to-r hover:from-red-600 hover:to-red-500 hover:border-red-500 transition-all shadow-sm relative z-10 group/btn mt-auto overflow-hidden">
                  <span className="flex items-center justify-center gap-2 relative z-10">
                     Gestionar Taller
                     <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </span>
               </button>
            </div>
         ))}
         
         <button 
            onClick={onAddWorkshop}
            className="bg-neutral-900/20 border-2 border-dashed border-neutral-800 p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:border-red-500/50 hover:bg-neutral-900/60 transition-all group shadow-sm hover:shadow-2xl relative overflow-hidden min-h-[320px]"
         >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <div className="w-16 h-16 rounded-2xl bg-neutral-800/50 border border-neutral-700 group-hover:border-red-500/50 group-hover:bg-red-500/10 flex items-center justify-center text-neutral-500 group-hover:text-red-500 transition-all relative z-10 group-hover:scale-110 duration-300">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <div className="text-center relative z-10 mt-2">
               <span className="block text-sm font-black uppercase tracking-widest text-neutral-400 group-hover:text-white transition-colors">Añadir Taller</span>
               <span className="block text-[11px] text-neutral-600 mt-2 font-medium tracking-wide">Pulsa para configurar</span>
            </div>
         </button>
      </div>
    </div>
  );
}
