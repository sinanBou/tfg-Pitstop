import { useState } from 'react';
import { useClientDashboard } from '../hooks/useClientDashboard';
import { VehicleModal } from '../components/features/client/vehicle/VehicleModal';
import { AppointmentModal } from '../components/features/client/appointments/AppointmentModal';
import { DashboardHeader } from '../components/layout/DashboardHeader/index';
import { BottomNav } from '../components/layout/BottomNav/index';
import { LoadingScreen } from '../components/common/LoadingScreen/index';
import { ClientOverviewTab } from '../components/features/client/ClientOverviewTab';
import { ClientVehiclesTab } from '../components/features/client/ClientVehiclesTab';
import { ClientAppointmentsTab } from '../components/features/client/ClientAppointmentsTab';
import { ClientHistoryTab } from '../components/features/client/ClientHistoryTab';

const SECCIONES = ['INICIO', 'VEHÍCULOS', 'CITAS', 'HISTORIAL'];

export default function ClientDashboard() {
  const { loading, userProfile, vehicles, workshops, appointments, history, registerVehicle, createAppointment, getAvailableSlots, getCatalogMakes, getCatalogModels, deleteAppointment, refresh } = useClientDashboard();

  const [activeTab, setActiveTab] = useState(0);

  
  // 2. Nuevo estado para abrir/cerrar modal del registro de vehiculo
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cocheEnTaller = vehicles.find((v) => v.status !== 'EN_CASA');

  const [isAppModalOpen, setIsAppModalOpen] = useState(false);


  if (loading) {
    return <LoadingScreen message="Sincronizando con el taller..." theme="client" />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black relative selection:bg-blue-500/30 selection:text-white pb-24">    
      {/* Fondo Glow Animado Global */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10 mix-blend-screen animate-pulse pointer-events-none"></div>

      {/* --- CONTENT AREA --- */}
      <DashboardHeader type="client" />

      {/* --- CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto relative z-10 scrollbar-hide pt-4">
         <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-12 animate-fade-in-up">
            
            <header className="flex justify-between items-end border-b border-neutral-800/60 pb-6 mb-8">
               <div>
                  <h1 className="text-3xl md:text-4xl font-black uppercase tracking-[0.15em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                     {SECCIONES[activeTab]}
                  </h1>
               </div>
            </header>

            {/* TAB CONTENT: INICIO */}
            {activeTab === 0 && <ClientOverviewTab vehicles={vehicles} appointments={appointments} cocheEnTaller={cocheEnTaller} userProfile={userProfile} />}
            {activeTab === 1 && <ClientVehiclesTab vehicles={vehicles} onAddVehicle={() => setIsModalOpen(true)} />}
            {activeTab === 2 && <ClientAppointmentsTab appointments={appointments} onAddAppointment={() => setIsAppModalOpen(true)} deleteAppointment={deleteAppointment} />}
            {activeTab === 3 && <ClientHistoryTab history={history} appointments={appointments} />}
         </div>
      </main>

      {/* --- FLOATING BOTTOM NAV --- */}
      <BottomNav tabs={SECCIONES} activeTab={activeTab} onTabChange={setActiveTab} theme="client" />

      <VehicleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={registerVehicle!} 
        fetchMakes={getCatalogMakes}
        fetchModels={getCatalogModels}
      />

      <AppointmentModal 
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        vehicles={vehicles}
        workshops={workshops}
        onSubmit={async (data) => {
          const success = await createAppointment(data);
          if (success) {
            refresh(); 
          }
          return success;
        }}
        fetchSlots={getAvailableSlots}
        existingAppointments={appointments}
      />

    </div>
  );
}