
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin'; 
import InputGroup from '../components/ui/InputGroup'; 

function Login() {
  const { formData, errors, isLoading, handleChange, handleLogin } = useLogin();

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col justify-center items-center p-6 relative">
      
      {/* Fondo Glow (ajustado a azul para un tema de login general) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] -z-10"></div>

      <div className="w-full max-w-4xl">
        <div className="max-w-xl mx-auto animate-fade-in-up">
            
          <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 shadow-2xl">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-white">Iniciar Sesión</h2>
              <p className="text-gray-500 text-sm">Bienvenido de nuevo a PitStop</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <InputGroup 
                label="Correo Electrónico *" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
                error={errors.email} 
                placeholder="tu@email.com" 
              />
              <InputGroup 
                label="Contraseña *" 
                name="password" 
                type="password" 
                value={formData.password} 
                onChange={handleChange} 
                error={errors.password} 
                placeholder="Tu contraseña" 
              />

              {/* Puedes mostrar un error general si el backend devuelve uno */}
              {errors.general && (
                <p className="text-red-500 text-sm text-center">{errors.general}</p>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className={`mt-4 w-full text-white font-bold py-3 rounded-lg transition-all ${
                  isLoading ? 'bg-gray-600 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/40' // Usando el tema azul para el botón de login
                }`}
              >
                {isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link to="/registration" className="text-gray-400 hover:text-white transition-colors">¿No tienes cuenta? <b>Regístrate</b></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login