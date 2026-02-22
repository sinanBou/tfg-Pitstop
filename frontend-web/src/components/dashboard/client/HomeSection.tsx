import FeatureCard from '../../ui/FeatureCard';

// Definimos la estructura exacta según tus DTOs del backend
interface UserDTO {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

interface VehicleDTO {
  id: number;
  brand: string;
  model: string;
  licensePlate: string;
  status: string;
}

interface HomeSectionProps {
  user: UserDTO | null; // Puede ser null mientras carga
  vehicles: VehicleDTO[];
}

export const HomeSection = ({vehicles }: HomeSectionProps) => {
  const cocheEnTaller = vehicles.find((v) => v.status !== 'EN_CASA');

  return (
    <section className="w-1/4 h-full p-6 overflow-y-auto pb-32 space-y-4">


      {vehicles.length > 0 ? (
        <FeatureCard 
          title="TU GARAJE" 
          description={`Tienes ${vehicles.length} vehículo(s) registrados.`} 
          borderColor="blue" 
        />
      ) : (
        <FeatureCard 
          title="SIN ACTIVIDAD" 
          description="Aún no has registrado ningún vehículo." 
          borderColor="red" 
        />
      )}

      {cocheEnTaller && (
        <div className="p-5 bg-neutral-900/60 rounded-2xl border border-blue-500/30">
          <p className="text-blue-500 text-[10px] font-bold uppercase mb-1">Estado Actual</p>
          <p className="text-white text-sm italic font-medium">
            Tu {cocheEnTaller.brand} {cocheEnTaller.model} está: <span className="text-blue-400">{cocheEnTaller.status}</span>
          </p>
        </div>
      )}
    </section>
  );
};