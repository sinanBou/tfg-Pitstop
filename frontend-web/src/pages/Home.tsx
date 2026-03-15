import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="w-full flex flex-col bg-zinc-950 font-sans selection:bg-red-600/30 selection:text-white relative overflow-hidden">
      
      {/* Global Background Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none z-0"></div>

      {/* --- NAVBAR --- */}
      <nav className="w-full fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-6 animate-fade-in-up">
         <div className="w-full max-w-6xl bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl px-6 py-4 flex justify-between items-center shadow-lg">
            <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">PitStop <span className="text-red-600 text-[10px] tracking-[0.2em] ml-1">v2.0</span></h1>
            <div className="flex gap-4 items-center">
               <Link to="/login" className="text-[10px] md:text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Iniciar Sesión</Link>
               <Link to="/registration" className="bg-white text-black text-[10px] md:text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-neutral-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">Comenzar</Link>
            </div>
         </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 w-full min-h-screen flex flex-col justify-center items-center text-center px-4 pt-32 pb-20">
         <div className="inline-flex items-center gap-2 px-4 py-2 mb-10 rounded-full border border-neutral-800 bg-neutral-900/50 backdrop-blur-md animate-fade-in-up">
            <span className="flex h-2 w-2 relative">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300">Sistema Activo y Sincronizado</span>
         </div>
         
         <h1 className="text-white text-5xl md:text-[6rem] font-black mb-8 max-w-5xl leading-[0.9] tracking-tighter uppercase italic animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Revoluciona la <br className="hidden md:block"/>
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-neutral-100 to-neutral-500">experiencia de taller</span>
         </h1>
         
         <p className="text-neutral-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            La única plataforma híbrida que ofrece control absoluto para los <span className="text-red-400 font-bold">Talleres</span> y transparencia total en tiempo real para los <span className="text-blue-400 font-bold">Conductores</span>.
         </p>

         <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link 
               to="/registration" 
               className="group relative inline-flex items-center justify-center bg-white text-black text-xs md:text-sm font-black uppercase tracking-widest py-4 px-10 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
            >
               <span className="relative z-10 flex items-center gap-3">
                  Crear Cuenta Gratis
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
               </span>
            </Link>
         </div>

         {/* Abstract Dashboard Mockup */}
         <div className="mt-20 w-full max-w-5xl relative animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10 pointer-events-none"></div>
            <div className="p-2 md:p-4 rounded-[2rem] bg-neutral-900/30 border border-neutral-800/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-neutral-500/50 to-transparent"></div>
               <div className="grid grid-cols-3 gap-2 md:gap-4 h-48 md:h-[400px] opacity-60">
                  <div className="col-span-1 rounded-xl bg-neutral-800/40 border border-neutral-700/30 line-pulse"></div>
                  <div className="col-span-2 grid grid-rows-2 gap-2 md:gap-4">
                     <div className="rounded-xl bg-neutral-800/40 border border-neutral-700/30 line-pulse" style={{ animationDelay: '0.2s' }}></div>
                     <div className="grid grid-cols-2 gap-2 md:gap-4">
                        <div className="rounded-xl bg-red-900/10 border border-red-500/20 line-pulse" style={{ animationDelay: '0.4s' }}></div>
                        <div className="rounded-xl bg-blue-900/10 border border-blue-500/20 line-pulse" style={{ animationDelay: '0.6s' }}></div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- BENTO GRID FEATURES --- */}
      <section className="relative z-10 w-full py-32 px-4 max-w-7xl mx-auto">
         <div className="text-center mb-20">
            <h2 className="text-sm font-black uppercase tracking-[0.4em] text-neutral-500 mb-4">Arquitectura Dual</h2>
            <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">Todo en un solo ecosistema</h3>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Taller Principal Header */}
            <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-neutral-900 to-black border border-red-900/30 p-10 md:p-14 rounded-[2.5rem] relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-600/10 blur-[80px] rounded-full group-hover:bg-red-600/20 transition-colors"></div>
               <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-64 h-64 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
               </div>
               <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <h4 className="text-3xl font-black text-white uppercase italic tracking-widest mb-4">Gestión de Taller Pro</h4>
                  <p className="text-neutral-400 font-medium leading-relaxed max-w-sm">Control total sobre tus slots de citas, horas operativas y registros de reparación. Cero papel, máxima eficiencia.</p>
               </div>
            </div>

            {/* Feature secundaria 1 */}
            <div className="col-span-1 bg-neutral-900/50 border border-neutral-800 p-10 rounded-[2.5rem] relative group hover:border-neutral-700 transition-colors flex flex-col justify-end">
               <div className="w-10 h-10 border border-neutral-700 rounded-xl flex items-center justify-center mb-6 text-neutral-400 group-hover:text-white group-hover:scale-110 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
               <h4 className="text-xl font-black text-white uppercase mb-2">Historial Digital</h4>
               <p className="text-sm text-neutral-500">Registro inmutable de todas las intervenciones en tu flota.</p>
            </div>

            {/* Feature secundaria 2 */}
            <div className="col-span-1 bg-neutral-900/50 border border-neutral-800 p-10 rounded-[2.5rem] relative group hover:border-neutral-700 transition-colors flex flex-col justify-end">
               <div className="w-10 h-10 border border-neutral-700 rounded-xl flex items-center justify-center mb-6 text-neutral-400 group-hover:text-blue-400 group-hover:scale-110 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
               </div>
               <h4 className="text-xl font-black text-white uppercase mb-2">Estado en Tiempo Real</h4>
               <p className="text-sm text-neutral-500">Recibe actualizaciones al instante sobre el progreso de tus vehículos.</p>
            </div>

            {/* Cliente Principal Header */}
            <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-neutral-900 to-black border border-blue-900/30 p-10 md:p-14 rounded-[2.5rem] relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-600/10 blur-[80px] rounded-full group-hover:bg-blue-600/20 transition-colors"></div>
               <div className="absolute -bottom-8 -left-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-64 h-64 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
               </div>
               <div className="relative z-10 flex flex-col items-end text-right h-full justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10h14l1.5 4H3.5L5 10z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 14v4h2v-4m10 0v4h2v-4M8 10V8c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2" /></svg>
                  </div>
                  <h4 className="text-3xl font-black text-white uppercase italic tracking-widest mb-4">Dashboard para Clientes</h4>
                  <p className="text-neutral-400 font-medium leading-relaxed max-w-sm">Supervisa toda tu flota con facilidad. Entiende exactamente qué se le está haciendo a tu coche y cuándo estará listo.</p>
               </div>
            </div>

         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="w-full border-t border-neutral-900 bg-black/60 backdrop-blur-md py-12 px-6 relative z-10 mt-20">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <h1 className="text-xl font-black italic tracking-tighter text-neutral-700 uppercase">PitStop</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600">© 2026 Plataforma PitStop. All rights reserved.</p>
         </div>
      </footer>

      {/* Estilos inline animaciones */}
      <style>{`
        @keyframes fade-in-up {
           0% { opacity: 0; transform: translateY(30px); filter: blur(10px); }
           100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-fade-in-up {
           animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
           opacity: 0;
        }
        
        @keyframes line-pulse {
           0% { background-color: rgba(63, 63, 70, 0.2); }
           50% { background-color: rgba(63, 63, 70, 0.5); }
           100% { background-color: rgba(63, 63, 70, 0.2); }
        }
        .line-pulse {
           animation: line-pulse 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  ) 
}