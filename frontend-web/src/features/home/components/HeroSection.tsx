import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
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
  );
};
