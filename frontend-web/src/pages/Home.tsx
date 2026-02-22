import { Link } from "react-router-dom";
import FeatureCard from "../components/ui/FeatureCard";

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center">
      
      {/* --- Portada --- */}
      <section className="w-full min-h-[75vh] flex flex-col justify-center items-center text-center px-4 relative">
        
        {/* Glow rojo de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[120px] -z-10"></div>

        {/* Título Dual */}
        <h1 className="text-white text-5xl md:text-7xl font-extrabold mb-6 max-w-5xl leading-tight">
          La plataforma que une <br/>
          <span className="text-red-600">profesionales</span> y <span className="text-white border-b-4 border-red-600">conductores</span>.
        </h1>
        
        <p className="text-gray-400 text-xl md:text-2xl mb-12 max-w-2xl">
          Una solución única de doble vía: gestión para el taller, transparencia total para el cliente.
        </p>

        <div className="flex flex-col sm:flex-row gap-5">
          <Link 
            to="/registration" 
            className="bg-red-600 hover:bg-red-700 text-white text-lg font-bold py-3 px-10 rounded-full transition-all "
          >
            Registrarse
          </Link>
          <Link 
            to="/login" 
            className="border border-neutral-600 text-gray-300 hover:border-white hover:text-white text-lg font-bold py-3 px-10 rounded-full transition-all"
          >
            Iniciar sesión
          </Link>
        </div>
      </section>

      {/* --- 2. SECCIÓN DIVIDIDA (Taller vs Cliente) --- */}
      <section className="w-full py-24 px-6 bg-neutral-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">

          {/* COLUMNA TALLER */}
          <div className="flex flex-col gap-8">
            <div className="mb-4">
            </div>

            {/* Tarjetas Reutilizables */}
            <FeatureCard 
              title="Gestión de Flota y Clientes"
              description="Base de datos centralizada. Asocia múltiples vehículos a un solo cliente..."
              borderColor="red"
            />
            <FeatureCard 
              title="Control de Reparaciones"
              description="Crea, edita y cierra órdenes de trabajo. Mantén un historial digital..."
              borderColor="red"
            />
          </div>

          {/* COLUMNA CLIENTE */}
          <div className="flex flex-col gap-8">
            <div className="mb-4 md:text-right">
            </div>

            <FeatureCard 
              title="Historial Digital"
              description="Olvídate de guardar facturas en la guantera..."
              borderColor="blue"
              alignment="right"
            />
            <FeatureCard 
              title="Estado en Tiempo Real"
              description="Sabe si tu coche está en espera, en reparación o listo..."
              borderColor="blue"
              alignment="right"
            />
          </div>

        </div>
      </section>

    </div>
  ) 
}