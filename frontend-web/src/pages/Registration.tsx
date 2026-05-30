import { Link } from 'react-router-dom';
import InputGroup from '@/components/common/InputGroup/InputGroup';
import { useState } from 'react';
import { useClientRegistration } from '@/features/auth/hooks/useClientRegistration';
import { useWorkshopRegistration } from '@/features/auth/hooks/useWorkshopRegistration';
import { RoleSelector } from '@/features/auth/components/RoleSelector';
import AddressAutocomplete from '@/components/common/AddressAutocomplete/AddressAutocomplete';

export default function Registration() {
  const [role, setRole] = useState<'workshop' | 'client' | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const clientReg = useClientRegistration();
  const workshopReg = useWorkshopRegistration();

  const isLoading = role === 'client' ? clientReg.isLoading : workshopReg.isLoading;

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: {[key: string]: string} = {};
    let isValid = true;

    const currentFormData = role === 'client' ? clientReg.formData : workshopReg.formData;

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

    // Tanto el cliente como el dueño deben ingresar NIF y teléfono obligatorios
    if (!currentFormData.nif) { newErrors.nif = 'El DNI/NIF es obligatorio.'; isValid = false; }
    if (!currentFormData.phoneNumber) { newErrors.phoneNumber = 'El teléfono es obligatorio.'; isValid = false; }

    setErrors(newErrors);

    if (isValid) {
      if (role === 'client') {
        await clientReg.registerClient(e);
      } else if (role === 'workshop') {
        await workshopReg.registerWorkshop(e);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-6 relative bg-zinc-950 font-sans selection:bg-red-500/30 selection:text-white overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen z-0"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none z-0"></div>

      <div className="w-full max-w-4xl z-10">
        
        {role === null && (
          <RoleSelector onSelectRole={setRole} />
        )}

        {role !== null && (
          <div className="max-w-xl mx-auto animate-fade-in-up">

            <button onClick={() => setRole(null)} className="flex items-center gap-2 text-neutral-500 hover:text-white mb-8 text-[10px] font-black uppercase tracking-widest transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Cambiar Perfil
            </button>

            <div className={`bg-neutral-950/60 backdrop-blur-xl p-10 sm:p-12 rounded-[2.5rem] border shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group ${role === 'workshop' ? 'border-red-900/30' : 'border-blue-900/30'}`}>

              <div className="mb-10 text-center">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Registro <span className={role === 'workshop' ? 'text-red-500' : 'text-blue-400'}>{role === 'workshop' ? 'Dueño' : 'Cliente'}</span></h2>
                <p className="text-neutral-500 text-sm font-medium tracking-wide">Configura tus credenciales de acceso</p>
              </div>

              <form onSubmit={handleRegistrationSubmit} className="flex flex-col gap-6">

                {role === 'workshop' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <InputGroup label="Nombre" name="firstname" value={workshopReg.formData.firstname} onChange={workshopReg.handleChange} error={errors.firstname} placeholder="Juan" />
                      <InputGroup label="Apellidos" name="lastname" value={workshopReg.formData.lastname} onChange={workshopReg.handleChange} error={errors.lastname} placeholder="Pérez" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <InputGroup label="DNI / NIF" name="nif" value={workshopReg.formData.nif} onChange={workshopReg.handleChange} error={errors.nif} placeholder="12345678Z" />
                      <InputGroup label="Teléfono" name="phoneNumber" value={workshopReg.formData.phoneNumber} onChange={workshopReg.handleChange} error={errors.phoneNumber} placeholder="600123456" />
                    </div>

                    <AddressAutocomplete 
                        label="Dirección del Dueño" 
                        name="address" 
                        value={workshopReg.formData.address || ''} 
                        onChange={(val: string) => workshopReg.handleChange({ target: { name: 'address', value: val } } as any)} 
                        error={errors.address} 
                        placeholder="Tu dirección personal..." 
                    />
                  </>
                )}

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

                    <AddressAutocomplete 
                      label="Dirección (Opcional)" 
                      name="address" 
                      value={clientReg.formData.address || ''} 
                      onChange={(val: string) => clientReg.handleChange({ target: { name: 'address', value: val } } as any)} 
                      error={errors.address} 
                      placeholder="Madrid, Calle..." 
                    />
                  </>
                )}

                <div className="border-t border-neutral-800/50 my-2 pt-6 flex flex-col gap-5 relative">
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