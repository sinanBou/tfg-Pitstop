import { Link } from 'react-router-dom';

interface RoleSelectorProps {
  onSelectRole: (role: 'workshop' | 'client') => void;
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  return (
    <div className="animate-fade-in text-center flex flex-col items-center">
      <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-neutral-800 bg-neutral-900/50 backdrop-blur-md">
         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Paso 1 de 2: Perfil</span>
      </div>

      <h2 className="text-4xl md:text-5xl font-black mb-4 text-white uppercase italic tracking-tighter">Únete a <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">PitStop</span></h2>
      <p className="text-neutral-500 mb-12 text-sm font-medium tracking-wide">Selecciona tu perfil operativo para comenzar.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        <button 
          onClick={() => onSelectRole('workshop')} 
          className="group relative bg-neutral-950/60 backdrop-blur-xl border border-neutral-800 p-12 rounded-[2.5rem] transition-all hover:bg-neutral-900/80 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(220,38,38,0.15)] overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 group-hover:scale-110 group-hover:bg-red-500/20 transition-all text-red-500">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h3 className="text-2xl font-black uppercase tracking-widest text-white group-hover:text-red-400 transition-colors">Soy Propietario</h3>
            <p className="text-neutral-500 mt-3 text-sm font-medium">Gestiona tu red de reparaciones y clientes desde la nube.</p>
          </div>
        </button>

        <button 
          onClick={() => onSelectRole('client')} 
          className="group relative bg-neutral-950/60 backdrop-blur-xl border border-neutral-800 p-12 rounded-[2.5rem] transition-all hover:bg-neutral-900/80 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all text-blue-400">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10h14l1.5 4H3.5L5 10z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 14v4h2v-4m10 0v4h2v-4M8 10V8c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2" /></svg>
            </div>
            <h3 className="text-2xl font-black uppercase tracking-widest text-white group-hover:text-blue-400 transition-colors">Soy Conductor</h3>
            <p className="text-neutral-500 mt-3 text-sm font-medium">Lleva el seguimiento digital de tus vehículos y citas.</p>
          </div>
        </button>
      </div>

      <div className="mt-16">
         <Link to="/login" className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
            ¿Ya tienes cuenta? <span className="text-white border-b border-white/30 hover:border-white">Inicia Sesión</span>
         </Link>
      </div>
    </div>
  );
}
