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
import { 
  LayoutDashboard, 
  Car, 
  Calendar, 
  Clock, 
  FileText
} from '@/assets/icons';
import { useTranslation } from '@/i18n';

export default function ClientDashboard() {
  const { t } = useTranslation();
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
  
  const SECCIONES = [
    t('nav.overview'), 
    t('nav.vehicles'), 
    t('nav.appointments'), 
    t('nav.history'), 
    t('nav.reports')
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstname: '',
    lastname: '',
    address: '',
    phoneNumber: ''
  });

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
    return <LoadingScreen message={t('common.loading')} theme="client" />;
  }

  const tabIcons = [
    LayoutDashboard,
    Car,
    Calendar,
    Clock,
    FileText
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 text-slate-900 dark:text-white flex flex-col font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-200/50 via-slate-100 to-slate-200/40 dark:from-neutral-900 dark:via-black dark:to-black relative selection:bg-blue-500/30 selection:text-blue-900 dark:selection:text-white pb-28">    
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none"></div>

      <DashboardHeader 
        type="client" 
        profilePictureUrl={clientProfile?.profilePictureUrl}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <main className="flex-1 overflow-y-auto relative z-10 scrollbar-hide pt-2">
         <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-4 space-y-6 animate-fade-in-up">
            
            {/* ── Barra de Navegación Superior Desktop & Título de Sección ── */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 dark:border-neutral-800/80 pb-5">
               {/* Título de la sección activa */}
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-sm">
                     {(() => {
                        const Icon = tabIcons[activeTab] || LayoutDashboard;
                        return <Icon className="w-5 h-5" />;
                     })()}
                  </div>
                  <div>
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 block leading-tight">
                        {t('clientDashboard.clientPortal')}
                     </span>
                     <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-slate-900 dark:text-white leading-tight">
                        {SECCIONES[activeTab]}
                     </h1>
                  </div>
               </div>
            </div>

            {activeTab === 0 && (
               <ClientOverviewTab 
                  vehicles={vehicles} 
                  appointments={appointments} 
                  userProfile={userProfile} 
                  onAddVehicle={() => setIsModalOpen(true)}
                  onAddAppointment={() => setIsAppModalOpen(true)}
                  onNavigateTab={setActiveTab}
               />
            )}
            {activeTab === 1 && (
               <ClientVehiclesTab 
                  vehicles={vehicles} 
                  appointments={appointments}
                  onAddVehicle={() => setIsModalOpen(true)} 
                  onDeleteVehicle={deleteVehicle} 
               />
            )}
            {activeTab === 2 && (
               <ClientAppointmentsTab 
                  appointments={appointments} 
                  onAddAppointment={() => setIsAppModalOpen(true)} 
                  deleteAppointment={deleteAppointment} 
               />
            )}
            {activeTab === 3 && (
               <ClientHistoryTab 
                  history={history} 
                  appointments={appointments} 
               />
            )}
            {activeTab === 4 && (
               <ClientReportsTab 
                  history={history} 
                  vehicles={vehicles} 
                  appointments={appointments} 
               />
            )}
         </div>
      </main>

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