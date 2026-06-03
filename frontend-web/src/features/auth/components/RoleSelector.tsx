import { Link } from 'react-router-dom';
import { Building, Car } from '@/assets/icons';

interface RoleSelectorProps {
  onSelectRole: (role: 'workshop' | 'client') => void;
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  return (
    <div className="animate-fade-in text-center flex flex-col items-center">
      <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-neutral-800 bg-neutral-900/50 backdrop-blur-md">
         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Paso 1 de 2: Perfil</span>
      </div>

      <h2 className="text-4xl md:text-5xl font-black mb-4 text-white uppercase tracking-tighter">Únete a <span className="text-red-600">PitStop</span></h2>
      <p className="text-neutral-500 mb-12 text-sm font-medium tracking-wide">Selecciona tu perfil operativo para comenzar.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        <button 
          onClick={() => onSelectRole('workshop')} 
          className="group relative bg-neutral-950/60 backdrop-blur-xl border border-neutral-800 p-12 rounded-[2.5rem] transition-all hover:bg-neutral-900/80 hover:-translate-y-2 overflow-hidden"
        >
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 group-hover:scale-110 group-hover:bg-red-500/20 transition-all text-red-500">
              <Building className="w-10 h-10" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-widest text-white group-hover:text-red-400 transition-colors">Soy Propietario</h3>
            <p className="text-neutral-500 mt-3 text-sm font-medium">Gestiona tu red de reparaciones y clientes desde la nube.</p>
          </div>
        </button>

        <button 
          onClick={() => onSelectRole('client')} 
          className="group relative bg-neutral-950/60 backdrop-blur-xl border border-neutral-800 p-12 rounded-[2.5rem] transition-all hover:bg-neutral-900/80 hover:-translate-y-2 overflow-hidden"
        >
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all text-blue-400">
              <Car className="w-10 h-10" strokeWidth={1.5} />
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
