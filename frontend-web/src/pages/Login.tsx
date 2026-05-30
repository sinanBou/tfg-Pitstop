
import { Link } from 'react-router-dom';
import { useLogin } from '@/features/auth/hooks/useLogin'; 
import InputGroup from '@/components/common/InputGroup/InputGroup'; 

function Login() {
  const { formData, errors, isLoading, handleChange, handleLogin } = useLogin();

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-6 relative bg-zinc-950 font-sans selection:bg-blue-500/30 selection:text-white overflow-hidden">
      
      {/* Fondo Glow estático */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none z-0"></div>

      <div className="w-full max-w-lg z-10 animate-fade-in-up">
        
        {/* Card Contenedor */}
        <div className="bg-neutral-950/60 backdrop-blur-xl p-10 sm:p-12 rounded-[2.5rem] border border-neutral-800/60 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">

          <div className="mb-10 text-center">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Iniciar Sesión</h2>
            <p className="text-neutral-500 text-sm font-medium tracking-wide">Bienvenido de nuevo a <span className="text-white font-bold">PitStop</span></p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <InputGroup 
              label="Correo Electrónico" 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              error={errors.email} 
              placeholder="tu@email.com" 
            />
            <InputGroup 
              label="Contraseña" 
              name="password" 
              type="password" 
              value={formData.password} 
              onChange={handleChange} 
              error={errors.password} 
              placeholder="••••••••" 
            />

            {errors.general && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                 <p className="text-red-400 text-xs font-black uppercase tracking-widest">{errors.general}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className={`mt-6 w-full text-white font-black uppercase tracking-widest text-sm py-4 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                isLoading 
                  ? 'bg-neutral-800 cursor-wait text-neutral-400' 
                  : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-[0.98]'
              }`}
            >
              {!isLoading && <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] bg-no-repeat group-hover:animate-[shimmer_2s_infinite_linear]" />}
              <span className="relative z-10">{isLoading ? 'Conectando...' : 'Acceder'}</span>
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-neutral-500 text-sm">
              ¿No tienes cuenta?{' '}
              <Link to="/registration" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
                Regístrate ahora
              </Link>
            </p>
          </div>
        </div>
        
        {/* Botón volver inicio discretamente debajo */}
        <div className="mt-8 text-center">
           <Link to="/" className="inline-flex items-center gap-2 text-neutral-600 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Volver al Inicio
           </Link>
        </div>
      </div>
      
      {/* Estilos inline para la animación del botón */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export default Login