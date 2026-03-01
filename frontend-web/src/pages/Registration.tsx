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
    if (role === 'workshop') {
      const workshopData = workshopReg.formData; // Usamos los datos específicos del taller
      if (!workshopData.companyName) { newErrors.workshopName = 'El nombre del taller es obligatorio.'; isValid = false; }
      if (!workshopData.cif) { newErrors.cif = 'El CIF es obligatorio.'; isValid = false; }
    } else if (role === 'client') {
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

    // Dentro de handleRegistrationSubmit en Registration.tsx

  if (role === 'workshop') {
    const { openTime, closeTime } = workshopReg.formData;
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/; // Valida formato 24h (00:00 a 23:59)

    if (!timeRegex.test(openTime)) {
      newErrors.openingTime = 'Use formato 24h (HH:mm).';
      isValid = false;
    }
    if (!timeRegex.test(closeTime)) {
      newErrors.closeTime = 'Use formato 24h (HH:mm).';
      isValid = false;
    }
  }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col justify-center items-center p-6 relative">

      {/* Fondo Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] -z-10"></div>

      <div className="w-full max-w-4xl">
        
        {/* --- FASE 1: SELECCIÓN DE ROL --- */}
        {role === null && (
          <div className="animate-fade-in text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Únete a <span className="text-red-600">PitStop</span></h2>
            <p className="text-gray-400 mb-12 text-lg">Selecciona tu perfil para comenzar.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={() => setRole('workshop')} 
                className="group bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-red-600 p-10 rounded-2xl transition-all cursor-pointer"
              >
                <div className="text-5xl mb-4">🛠️</div>
                <h3 className="text-2xl font-bold text-white">Soy Taller</h3>
                <p className="text-gray-400 mt-2">Gestionar reparaciones y clientes.</p>
              </button>

              <button 
                onClick={() => setRole('client')} 
                className="group bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-blue-500 p-10 rounded-2xl transition-all cursor-pointer"
              >
                <div className="text-5xl mb-4">🚘</div>
                <h3 className="text-2xl font-bold text-white">Soy Conductor</h3>
                <p className="text-gray-400 mt-2">Consultar estado de mi coche.</p>
              </button>
            </div>

            <div className="mt-12">
              <Link to="/login" className="text-gray-400 hover:text-white transition-colors">¿Ya tienes cuenta? <b>Inicia Sesión</b></Link>
            </div>
          </div>
        )}

        {/* --- FASE 2: FORMULARIO --- */}
        {role !== null && (
          <div className="max-w-xl mx-auto animate-fade-in-up">

            <button onClick={() => setRole(null)} className="text-gray-400 hover:text-white mb-6 font-bold text-sm">← Volver</button>

            <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 shadow-2xl">
              <div className="mb-6 text-center">
                <h2 className="text-3xl font-bold text-white">Registro de {role === 'workshop' ? 'Taller' : 'Cliente'}</h2>
                <p className="text-gray-500 text-sm">Rellena los datos obligatorios (*)</p>
              </div>
              {/* El onSubmit ahora llama a nuestra función de manejo local */}
              <form onSubmit={handleRegistrationSubmit} className="flex flex-col gap-4">

                {/* --- CAMPOS PARA TALLER --- */}
                {role === 'workshop' && (
                  <>
                    {/* Datos del Dueño */}
                    <div className="flex gap-4">
                      <InputGroup label="Nombre Dueño *" name="firstname" value={workshopReg.formData.firstname} onChange={workshopReg.handleChange} error={errors.firstname} placeholder="Juan" />
                      <InputGroup label="Apellidos Dueño *" name="lastname" value={workshopReg.formData.lastname} onChange={workshopReg.handleChange} error={errors.lastname} placeholder="Pérez" />
                    </div>

                    {/* Datos de la Empresa - Separador visual */}
                    <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-700 my-2">
                        <h4 className="text-gray-400 text-xs font-bold uppercase mb-3 tracking-widest">Datos de la Empresa</h4>
                        <div className="flex flex-col gap-3">
                            <InputGroup label="Nombre Comercial Taller *" name="companyName" value={workshopReg.formData.companyName} onChange={workshopReg.handleChange} error={errors.workshopName} placeholder="Ej: Talleres Motosport" />
                            <InputGroup label="CIF *" name="cif" value={workshopReg.formData.cif} onChange={workshopReg.handleChange} error={errors.cif} placeholder="B-12345678" />
                            <div className="flex gap-4">
                              <InputGroup 
                                label="Hora Apertura (HH:mm) *" 
                                name="openTime" 
                                type="text" 
                                value={workshopReg.formData.openTime} 
                                onChange={workshopReg.handleChange} 
                                error={errors.openTime}
                                placeholder="09:00"
                                maxLength={5}
                                // maxLength se asegura de que el formato no se rompa
                              />
                              <InputGroup 
                                label="Hora Cierre (HH:mm) *" 
                                name="closeTime" 
                                type="text" 
                                value={workshopReg.formData.closeTime} 
                                onChange={workshopReg.handleChange} 
                                error={errors.closeTime}
                                placeholder="18:00"
                                maxLength={5}
                              />
                            </div>
                        </div>
                    </div>
                  </>
                )}

                {/* --- CAMPOS PARA CLIENTE --- */}
                {role === 'client' && (
                  <>
                    <div className="flex gap-4"> {/* Usamos los datos y manejadores del hook de cliente */}
                      <InputGroup label="Nombre *" name="firstname" value={clientReg.formData.firstname} onChange={clientReg.handleChange} error={errors.firstname} placeholder="Carlos" />
                      <InputGroup label="Apellidos *" name="lastname" value={clientReg.formData.lastname} onChange={clientReg.handleChange} error={errors.lastname} placeholder="Sainz" />
                    </div>

                    <div className="flex gap-4">
                      <InputGroup label="DNI / NIF *" name="nif" value={clientReg.formData.nif} onChange={clientReg.handleChange} error={errors.nif} placeholder="12345678Z" />
                      <InputGroup label="Teléfono *" name="phoneNumber" value={clientReg.formData.phoneNumber} onChange={clientReg.handleChange} error={errors.phoneNumber} placeholder="600123456" />
                    </div>

                    <InputGroup label="Dirección (Opcional)" name="address" value={clientReg.formData.address} onChange={clientReg.handleChange} error={errors.address} placeholder="C/ Ejemplo 123, Madrid" />
                  </>
                )}

                {/* --- CAMPOS COMUNES (Login) --- */}
                <div className="border-t border-neutral-800 my-2 pt-4">
                  <InputGroup label="Correo Electrónico *" name="email" type="email" value={role === 'client' ? clientReg.formData.email : workshopReg.formData.email} onChange={role === 'client' ? clientReg.handleChange : workshopReg.handleChange} error={errors.email} placeholder="tu@email.com" />
                  <InputGroup label="Contraseña *" name="password" type="password" value={role === 'client' ? clientReg.formData.password : workshopReg.formData.password} onChange={role === 'client' ? clientReg.handleChange : workshopReg.handleChange} error={errors.password} placeholder="Mín 8 car, 1 Mayús, 1 Núm" />
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className={`mt-4 w-full text-white font-bold py-3 rounded-lg transition-all ${
                    isLoading ? 'bg-gray-600 cursor-wait' : 
                    role === 'workshop' ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/40' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/40'
                  }`}
                >
                  {isLoading ? 'Registrando...' : 'Crear Cuenta'}
                </button>

              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}