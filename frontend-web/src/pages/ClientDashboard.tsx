import { useState } from 'react';
import { useClientDashboard } from '../hooks/useClientDashboard';
import { VehicleModal } from '../components/dashboard/client/vehicle/VehicleModal';
import { AppointmentModal } from '../components/dashboard/client/appointments/AppoointmentModal';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { BottomNav } from '../components/dashboard/BottomNav';
import { LoadingScreen } from '../components/dashboard/LoadingScreen';
import { ClientOverviewTab } from '../components/dashboard/client/tabs/ClientOverviewTab';
import { ClientVehiclesTab } from '../components/dashboard/client/tabs/ClientVehiclesTab';
import { ClientAppointmentsTab } from '../components/dashboard/client/tabs/ClientAppointmentsTab';
import { ClientHistoryTab } from '../components/dashboard/client/tabs/ClientHistoryTab';

const SECCIONES = ['INICIO', 'VEHÍCULOS', 'CITAS', 'HISTORIAL'];

export default function ClientDashboard() {
  const { loading, vehicles, workshops, appointments, history, registerVehicle, createAppointment, getAvailableSlots, deleteAppointment,refresh } = useClientDashboard();
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

      {/* Top Header */}
      <DashboardHeader type="client" />

      {/* --- CONTENT AREA --- */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto relative z-10 scrollbar-hide">
         
         <div className="max-w-5xl mx-auto space-y-12 animate-fade-in-up">
            
            <header className="flex justify-between items-end border-b border-neutral-800/60 pb-6 mb-8">
               <div>
                  <h1 className="text-3xl md:text-4xl font-black uppercase tracking-[0.15em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                     {SECCIONES[activeTab]}
                  </h1>
               </div>
            </header>

            {/* TAB CONTENT: INICIO */}
            {activeTab === 0 && <ClientOverviewTab vehicles={vehicles} appointments={appointments} cocheEnTaller={cocheEnTaller} />}
            {activeTab === 1 && <ClientVehiclesTab vehicles={vehicles} onAddVehicle={() => setIsModalOpen(true)} />}
            {activeTab === 2 && <ClientAppointmentsTab appointments={appointments} onAddAppointment={() => setIsAppModalOpen(true)} deleteAppointment={deleteAppointment} />}
            {activeTab === 3 && <ClientHistoryTab history={history} />}
         </div>
      </main>

      {/* --- FLOATING BOTTOM NAV --- */}
      <BottomNav tabs={SECCIONES} activeTab={activeTab} onTabChange={setActiveTab} theme="client" />

      <VehicleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={registerVehicle!} 
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
      />

    </div>
  );
}