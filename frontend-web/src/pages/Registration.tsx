import { Link } from 'react-router-dom';
import InputGroup from '../components/ui/InputGroup';
import { useState } from 'react'; // Importamos useState
import { useClientRegistration } from '../hooks/useClientRegistration'; // Importamos el hook de cliente
import { useWorkshopRegistration } from '../hooks/useWorkshopRegistration'; // Importamos el hook de taller

export default function Registration() {
  const [role, setRole] = useState<'workshop' | 'client' | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Inicializamos ambos hooks
  const clientReg = useClientRegistration();
  const workshopReg = useWorkshopRegistration();

  // Determinamos qué estado de carga usar para el botón de envío
  const isLoading = role === 'client' ? clientReg.isLoading : workshopReg.isLoading;

  // Función para manejar el envío del formulario de registro
  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevenimos el comportamiento por defecto del formulario

    const newErrors: {[key: string]: string} = {};
    let isValid = true;

    // Obtenemos los datos del formulario y el manejador de cambios del hook activo
    const currentFormData = role === 'client' ? clientReg.formData : workshopReg.formData;

    // Validaciones comunes (nombre, apellidos, email, contraseña)
    if (!currentFormData.firstname) { newErrors.firstname = 'El nombre es obligatorio.'; isValid = false; }
    if (!currentFormData.lastname) { newErrors.lastname = 'Los apellidos son obligatorios.'; isValid = false; }
    if (!currentFormData.email) { newErrors.email = 'El correo electrónico es obligatorio.'; isValid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentFormData.email)) {
      newErrors.email = 'Formato de email inválido.'; isValid = false;
    }
    if (!currentFormData.password) { newErrors.password = 'La contraseña es obligatoria.'; isValid = false; }
    else if (currentFormData.password.length < 8 || !/[A-Z]/.test(currentFormData.password) || !/[0-9]/.test(currentFormData.password)) {
      newErrors.password = 'Mín 8 car, 1 Mayús, 1 Núm.'; isValid = false;
    }

    // Validaciones específicas según el rol
    if (role === 'client') {
      const clientData = clientReg.formData; // Usamos los datos específicos del cliente
      if (!clientData.nif) { newErrors.nif = 'El DNI/NIF es obligatorio.'; isValid = false; }
      if (!clientData.phoneNumber) { newErrors.phoneNumber = 'El teléfono es obligatorio.'; isValid = false; }
      // La dirección es opcional, no necesita validación aquí
    }

    setErrors(newErrors); // Actualizamos el estado de errores

    if (isValid) {
      // Si la validación pasa, llamamos a la función de registro del hook correspondiente
      if (role === 'client') {
        await clientReg.registerClient(e);
      } else if (role === 'workshop') {
        await workshopReg.registerWorkshop(e);
      }
    }

    // Validaciones de tiempo para taller fueron eliminadas ya que ahora se registran en el dashboard.
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-6 relative bg-zinc-950 font-sans selection:bg-red-500/30 selection:text-white overflow-hidden">
      
      {/* Fondo Glow Animado */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen animate-pulse z-0"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none z-0"></div>

      <div className="w-full max-w-4xl z-10">
        
        {/* --- FASE 1: SELECCIÓN DE ROL --- */}
        {role === null && (
          <div className="animate-fade-in text-center flex flex-col items-center">
            
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-neutral-800 bg-neutral-900/50 backdrop-blur-md">
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Paso 1 de 2: Perfil</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black mb-4 text-white uppercase italic tracking-tighter">Únete a <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">PitStop</span></h2>
            <p className="text-neutral-500 mb-12 text-sm font-medium tracking-wide">Selecciona tu perfil operativo para comenzar.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
              <button 
                onClick={() => setRole('workshop')} 
                className="group relative bg-neutral-950/60 backdrop-blur-xl border border-neutral-800 p-12 rounded-[2.5rem] transition-all hover:bg-neutral-900/80 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(220,38,38,0.15)] overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 group-hover:scale-110 group-hover:bg-red-500/20 transition-all text-red-500">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-widest text-white group-hover:text-red-400 transition-colors">Soy Taller</h3>
                  <p className="text-neutral-500 mt-3 text-sm font-medium">Gestiona tu red de reparaciones y clientes desde la nube.</p>
                </div>
              </button>

              <button 
                onClick={() => setRole('client')} 
                className="group relative bg-neutral-950/60 backdrop-blur-xl border border-neutral-800 p-12 rounded-[2.5rem] transition-all hover:bg-neutral-900/80 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all text-blue-400">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10h14l1.5 4H3.5L5 10z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 14v4h2v-4m10 0v4h2v-4M8 10V8c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2" /></svg>
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-widest text-white group-hover:text-blue-400 transition-colors">Conductor</h3>
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
        )}

        {/* --- FASE 2: FORMULARIO --- */}
        {role !== null && (
          <div className="max-w-xl mx-auto animate-fade-in-up">

            <button onClick={() => setRole(null)} className="flex items-center gap-2 text-neutral-500 hover:text-white mb-8 text-[10px] font-black uppercase tracking-widest transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Cambiar Perfil
            </button>

            <div className={`bg-neutral-950/60 backdrop-blur-xl p-10 sm:p-12 rounded-[2.5rem] border shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group ${role === 'workshop' ? 'border-red-900/30' : 'border-blue-900/30'}`}>
              
              <div className={`absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500 ${role === 'workshop' ? 'via-red-500/50' : 'via-blue-500/50'}`}></div>

              <div className="mb-10 text-center">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Registro <span className={role === 'workshop' ? 'text-red-500' : 'text-blue-400'}>{role === 'workshop' ? 'Taller' : 'Cliente'}</span></h2>
                <p className="text-neutral-500 text-sm font-medium tracking-wide">Configura tus credenciales de acceso</p>
              </div>

              <form onSubmit={handleRegistrationSubmit} className="flex flex-col gap-6">

                {/* --- CAMPOS PARA TALLER --- */}
                {role === 'workshop' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputGroup label="Nombre" name="firstname" value={workshopReg.formData.firstname} onChange={workshopReg.handleChange} error={errors.firstname} placeholder="Juan" />
                    <InputGroup label="Apellidos" name="lastname" value={workshopReg.formData.lastname} onChange={workshopReg.handleChange} error={errors.lastname} placeholder="Pérez" />
                  </div>
                )}

                {/* --- CAMPOS PARA CLIENTE --- */}
                {role === 'client' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <InputGroup label="Nombre" name="firstname" value={clientReg.formData.firstname} onChange={clientReg.handleChange} error={errors.firstname} placeholder="Carlos" />
                      <InputGroup label="Apellidos" name="lastname" value={clientReg.formData.lastname} onChange={clientReg.handleChange} error={errors.lastname} placeholder="Sainz" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <InputGroup label="DNI / NIF" name="nif" value={clientReg.formData.nif} onChange={clientReg.handleChange} error={errors.nif} placeholder="12345678Z" />
                      <InputGroup label="Teléfono" name="phoneNumber" value={clientReg.formData.phoneNumber} onChange={clientReg.handleChange} error={errors.phoneNumber} placeholder="600123456" />
                    </div>

                    <InputGroup label="Dirección (Opcional)" name="address" value={clientReg.formData.address} onChange={clientReg.handleChange} error={errors.address} placeholder="Madrid" />
                  </>
                )}

                {/* --- CAMPOS COMUNES (Login) --- */}
                <div className="border-t border-neutral-800/50 my-2 pt-6 flex flex-col gap-5 relative">
                  <div className="absolute -top-3left-1/2 -translate-x-1/2 bg-neutral-950 px-3 text-[10px] font-black uppercase tracking-widest text-neutral-600">Credenciales</div>
                  
                  <InputGroup label="Correo Electrónico" name="email" type="email" value={role === 'client' ? clientReg.formData.email : workshopReg.formData.email} onChange={role === 'client' ? clientReg.handleChange : workshopReg.handleChange} error={errors.email} placeholder="tu@email.com" />
                  <InputGroup label="Contraseña" name="password" type="password" value={role === 'client' ? clientReg.formData.password : workshopReg.formData.password} onChange={role === 'client' ? clientReg.handleChange : workshopReg.handleChange} error={errors.password} placeholder="Mín 8 car, 1 Mayús, 1 Núm" />
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className={`mt-6 w-full text-white font-black uppercase tracking-widest text-sm py-4 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                    isLoading 
                      ? 'bg-neutral-800 cursor-wait text-neutral-400' 
                      : role === 'workshop' 
                        ? 'bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] active:scale-[0.98]' 
                        : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-[0.98]'
                  }`}
                >
                  {!isLoading && <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] bg-no-repeat group-hover:animate-[shimmer_2s_infinite_linear]" />}
                  <span className="relative z-10">{isLoading ? 'Procesando...' : 'Crear Cuenta'}</span>
                </button>

              </form>
            </div>
            
             <div className="mt-8 text-center">
               <Link to="/" className="inline-flex items-center gap-2 text-neutral-600 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
                  Volver al Inicio
               </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}