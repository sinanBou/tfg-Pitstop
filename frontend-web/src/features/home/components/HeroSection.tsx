import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative z-10 w-full min-h-screen flex flex-col justify-center items-center text-center px-4 pt-32 pb-20">
      
      <h1 className="text-white text-5xl md:text-[6rem] font-black mb-8 max-w-5xl leading-[0.9] tracking-tighter uppercase animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        Revoluciona la <br className="hidden md:block"/>
        <span>experiencia de taller</span>
      </h1>
      
      <p className="text-neutral-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        La única plataforma híbrida que ofrece control absoluto para los <span className="text-red-400 font-bold">Talleres</span> y transparencia total en tiempo real para los <span className="text-blue-400 font-bold">Conductores</span>.
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <Button 
          onClick={() => navigate('/registration')} 
          variant="primary"
          className="shadow-[0_0_40px_rgba(255,255,255,0.2)] !bg-white !text-black hover:!bg-neutral-200 border-transparent transition-all duration-300 scale-105 active:scale-95 px-10 py-4"
          glow={false}
        >
          <span className="relative z-10 flex items-center gap-3">
            Registrarse
            </span>
        </Button>
        <Button 
          onClick={() => navigate('/login')} 
          variant="ghost"
          className="border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition-all duration-300 scale-105 active:scale-95 px-10 py-4"
        >
          <span className="relative z-10 flex items-center gap-3">
            Iniciar Sesión
           </span>
        </Button>
      </div>

      <div className="mt-24 w-full max-w-5xl relative animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-900/40 border border-neutral-800/80 p-8 rounded-[2rem] text-left relative overflow-hidden group hover:border-red-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h4 className="text-white text-lg font-black uppercase tracking-wider mb-2">Panel del Taller</h4>
            <p className="text-neutral-400 text-sm leading-relaxed font-medium">Control absoluto sobre citas, asignación en directo de mecánicos, kilometraje y recepción de vehículos.</p>
          </div>

          <div className="bg-neutral-900/40 border border-neutral-800/80 p-8 rounded-[2rem] text-left relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h4 className="text-white text-lg font-black uppercase tracking-wider mb-2">Área de Clientes</h4>
            <p className="text-neutral-400 text-sm leading-relaxed font-medium">Garaje virtual con estado en tiempo real, notificaciones automáticas y descarga de facturas en PDF.</p>
          </div>

          <div className="bg-neutral-900/40 border border-neutral-800/80 p-8 rounded-[2rem] text-left relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-yellow-600/10 border border-yellow-500/20 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            </div>
            <h4 className="text-white text-lg font-black uppercase tracking-wider mb-2">Inventario y Facturación</h4>
            <p className="text-neutral-400 text-sm leading-relaxed font-medium">Gestión inteligente de repuestos, stock del taller y generación de presupuestos / facturas simplificadas.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
