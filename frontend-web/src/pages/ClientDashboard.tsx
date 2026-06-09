import { useState, useEffect } from 'react';
import { useClientDashboard } from '@/features/client/hooks/useClientDashboard';
import { VehicleModal } from '@/features/vehicles/components/VehicleModal';
import { ClientAppointmentModal } from '@/features/appointments/ClientAppointmentModal';
import { DashboardHeader } from '@/components/layout/DashboardHeader/index';
import { BottomNav } from '@/components/layout/BottomNav/index';
import { LoadingScreen } from '@/components/common/LoadingScreen/LoadingScreen';
import { ClientOverviewTab } from '@/features/client/components/ClientOverviewTab';
import { ClientVehiclesTab } from '@/features/client/components/ClientVehiclesTab';
import { ClientAppointmentsTab } from '@/features/client/components/ClientAppointmentsTab';
import { ClientHistoryTab } from '@/features/client/components/ClientHistoryTab';
import { ClientReportsTab } from '@/features/client/components/ClientReportsTab';
import { MiPerfilCliente } from '@/features/client/components/MiPerfilCliente';

const SECCIONES = ['INICIO', 'VEHÍCULOS', 'CITAS', 'NOTIFICACIONES', 'INFORMES'];

/**
 * Panel Principal de Clientes (ClientDashboard).
 * 
 * Permite a los clientes registrados interactuar con el taller realizando las siguientes acciones:
 * - Consultar el estado en tiempo real de sus vehículos e intervenciones en curso (ClientOverviewTab).
 * - Dar de alta, consultar y dar de baja sus vehículos (ClientVehiclesTab / VehicleModal).
 * - Solicitar y gestionar citas cruzando horarios disponibles con el calendario del taller (ClientAppointmentsTab / ClientAppointmentModal).
 * - Consultar el historial de reparaciones y facturas completadas en el taller (ClientHistoryTab).
 * - Visualizar informes de mantenimiento y estadísticas de gastos acumulados (ClientReportsTab).
 * - Modificar sus datos personales y preferencias de contacto (MiPerfilCliente).
 */
export default function ClientDashboard() {
  const { 
    loading, 
    userProfile, 
    clientProfile,
    vehicles, 
    workshops, 
    appointments, 
    history, 
    registerVehicle, 
    createAppointment, 
    getAvailableSlots, 
    getCatalogMakes, 
    getCatalogModels, 
    deleteAppointment, 
    deleteVehicle, 
    refresh,
    handleProfileUpdate
  } = useClientDashboard();

  const [activeTab, setActiveTab] = useState(0);
  
  // 2. Nuevo estado para abrir/cerrar modal del registro de vehiculo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);

  // Estados de perfil
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstname: '',
    lastname: '',
    address: '',
    phoneNumber: ''
  });

  // Sincronizar formulario al cargar el perfil del cliente
  useEffect(() => {
    if (clientProfile) {
      setProfileForm({
        firstname: clientProfile.firstname || '',
        lastname: clientProfile.lastname || '',
        address: clientProfile.address || '',
        phoneNumber: clientProfile.phoneNumber || ''
      });
    }
  }, [clientProfile]);


  if (loading) {
    return <LoadingScreen message="Sincronizando con el taller..." theme="client" />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black relative selection:bg-blue-500/30 selection:text-white pb-24">    
      {/* Fondo Glow Estático Global */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none"></div>

      {/* --- CONTENT AREA --- */}
      <DashboardHeader 
        type="client" 
        profilePictureUrl={clientProfile?.profilePictureUrl}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

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
            {activeTab === 0 && <ClientOverviewTab vehicles={vehicles} appointments={appointments} userProfile={userProfile} />}
            {activeTab === 1 && <ClientVehiclesTab vehicles={vehicles} onAddVehicle={() => setIsModalOpen(true)} onDeleteVehicle={deleteVehicle} />}
            {activeTab === 2 && <ClientAppointmentsTab appointments={appointments} onAddAppointment={() => setIsAppModalOpen(true)} deleteAppointment={deleteAppointment} />}
            {activeTab === 3 && <ClientHistoryTab history={history} appointments={appointments} />}
            {activeTab === 4 && <ClientReportsTab history={history} vehicles={vehicles} appointments={appointments} />}
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

      <ClientAppointmentModal 
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

      {clientProfile && (
        <MiPerfilCliente
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          clientProfile={clientProfile}
          profileForm={profileForm}
          setProfileForm={setProfileForm}
          onSubmit={async (form) => {
            await handleProfileUpdate(form);
          }}
        />
      )}

    </div>
  );
}