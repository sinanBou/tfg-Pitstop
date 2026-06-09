import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, ArrowRight } from '@/assets/icons';
import { GenerateInvoiceModal } from '@/features/workshop/components/modals/GenerateInvoiceModal/index';
import { DashboardHeader } from '@/components/layout/DashboardHeader/index';
import { BottomNav } from '@/components/layout/BottomNav/index';
import { StaffAppointmentModal } from '@/features/appointments/StaffAppointmentModal/index';
import { useWorkshopAdmin } from '@/features/workshop/hooks/useWorkshopAdmin';
import { OverviewTab } from '@/features/workshop/components/admin/tabs/OverviewTab/OverviewTab';
import { AppointmentsTab } from '@/features/workshop/components/admin/tabs/AppointmentsTab';
import { TeamTab } from '@/features/workshop/components/admin/tabs/TeamTab/TeamTab';
import { CompletedJobsTab } from '@/features/workshop/components/admin/tabs/CompletedJobsTab';
import { TasksTab } from '@/features/workshop/components/admin/tabs/TasksTab';
import { PartsTab } from '@/features/workshop/components/admin/tabs/PartsTab';
import { ReportsTab } from '@/features/workshop/components/admin/tabs/ReportsTab';
import { ImagePreviewModal } from '@/components/common/ImagePreviewModal/ImagePreviewModal';
import { AvisosTab } from '@/features/workshop/components/admin/tabs/AvisosTab/AvisosTab';
import { DateNavigator } from '@/components/common/DateNavigator/DateNavigator';
import { AppointmentSearch } from '@/features/workshop/components/admin/AppointmentSearch/index';
import { MechanicSearch } from '@/features/workshop/components/admin/MechanicSearch/index';
import { CitasTab } from '@/features/workshop/components/admin/tabs/CitasTab';
import { PlanningTimeline } from '@/features/workshop/components/admin/tabs/AppointmentsTab/PlanningTimeline';
import { Card } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { TaskChecklistModal } from '@/features/workshop/components/modals/TaskChecklistModal/index';
import { MechanicTaskModal } from '@/features/workshop/components/modals/MechanicTaskModal/index';
import { PerfilTaller } from '@/features/workshop/components/admin/PerfilTaller/PerfilTaller';
import { MiPerfil } from '@/features/workshop/components/admin/MiPerfil/MiPerfil';

const diasSemana = [
  { value: 'LUNES', label: 'Lunes' },
  { value: 'MARTES', label: 'Martes' },
  { value: 'MIERCOLES', label: 'Miércoles' },
  { value: 'JUEVES', label: 'Jueves' },
  { value: 'VIERNES', label: 'Viernes' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' },
];

/**
 * Panel de Administración y Control Operativo del Taller (WorkshopAdminDashboard).
 * 
 * Centraliza toda la lógica de gestión para Propietarios (Owners) y Gestores (Managers).
 * Actúa como orquestador de las pestañas principales del Dashboard del taller:
 * - Resumen general (OverviewTab)
 * - Alertas y avisos de almacén/retrasos (AvisosTab)
 * - Recepción y control de citas de clientes (CitasTab)
 * - Planificador temporal interactivo (AppointmentsTab / PlanningTimeline)
 * - Liquidación y facturación (CompletedJobsTab / GenerateInvoiceModal)
 * - Agenda individual por mecánico
 * - Gestión de catálogo de tareas (TasksTab)
 * - Control de stock de almacén (PartsTab)
 * - Informes analíticos y de rendimiento (ReportsTab)
 * - Alta y control de plantilla (TeamTab)
 * 
 * Integra los modales para planificar servicios, listas de verificación, check-in
 * y actualización de los perfiles del empleado y de taller.
 */
export default function WorkshopAdminDashboard() {
  const [invoicingJob, setInvoicingJob] = useState<any | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [checklistItem, setChecklistItem] = useState<any>(null);
  const [selectedAgendaEmployeeId, setSelectedAgendaEmployeeId] = useState<string | null>(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isWorkshopSettingsOpen, setIsWorkshopSettingsOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ firstname: '', lastname: '', address: '', nif: '', phoneNumber: '' });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLogoPreviewOpen, setIsLogoPreviewOpen] = useState(false);

  const {
    id,
    activeTab, setActiveTab,
    selectedDate, setSelectedDate,
    loading,
    workshopData,
    appointments,
    employees,
    isAppModalOpen, setIsAppModalOpen,
    settingsForm, setSettingsForm,
    employeeForm, setEmployeeForm,
    fetchWorkshopData,
    handleSettingsSubmit,
    handleEmployeeSubmit,
    handleDeleteEmployee,
    handlePromoteEmployee,
    handleDemoteEmployee,
    handleRescheduleAppointment,
    updateAppointmentStatus,
    updateTaskStatus,
    handleRescheduleTask,
    handleDeleteTask,
    handleDeleteAppointment,
    completeJob,
    markPickedUp,
    checkInVehicle,
    readyForCompletion,
    goToNextUnassignedDate,
    goToNextPendingDate,
    employeeProfile,
    workshopTasks,
    delayedTasks,
    handleProfileUpdate,
    handleUploadAvatar,
    handleDeleteAvatar,
    handleUploadWorkshopLogo,
    handleDeleteWorkshopLogo,
    userRole
  } = useWorkshopAdmin();



  useEffect(() => {
    if (employeeProfile?.id && !selectedAgendaEmployeeId) {
      setSelectedAgendaEmployeeId(employeeProfile.id);
    }
  }, [employeeProfile, selectedAgendaEmployeeId]);

  useEffect(() => {
    if (employeeProfile) {
      setProfileForm({
        firstname: employeeProfile.firstname || '',
        lastname: employeeProfile.lastname || '',
        address: employeeProfile.address || '',
        nif: employeeProfile.nif || '',
        phoneNumber: employeeProfile.phoneNumber || ''
      });
    }
  }, [employeeProfile]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
       <div className="w-16 h-16 border-t-2 border-red-600 rounded-full animate-spin"></div>
    </div>
  );

  const isOwner = userRole === 'WORKSHOP_OWNER';
  const SECCIONES = ['RESUMEN', 'AVISOS', 'CITAS', 'PLANIFICACIÓN', 'FINALIZADOS', 'AGENDA', 'TAREAS', 'ALMACÉN', 'INFORMES', 'EQUIPO'];

  const isSameDate = (isoString: string) => {
      const appDate = new Date(isoString);
      return appDate.getFullYear() === selectedDate.getFullYear() &&
             appDate.getMonth() === selectedDate.getMonth() &&
             appDate.getDate() === selectedDate.getDate();
  };

  // Citas Pendientes de Confirmar
  const pendingAppointments = appointments.filter(a => a.status === 'PENDING' && isSameDate(a.dateTime));

  // Items para la agenda
  const combinedPlanningItems = [
      ...appointments.filter(a => a.status !== 'PENDING' && a.status !== 'IN_PROGRESS' && a.status !== 'COMPLETED' && a.status !== 'CANCELLED' && a.status !== 'PICKED_UP' && isSameDate(a.dateTime)),
      ...workshopTasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && t.status !== 'PICKED_UP').map(t => ({ ...t, isTask: true }))
  ];

  const agendaItems = combinedPlanningItems.filter(item => {
    return item.assignedEmployeeId === selectedAgendaEmployeeId;
  });

  const selectedEmpObj = employees.find(e => e.id === selectedAgendaEmployeeId) || employeeProfile;

  const handleUpdateStatus = (id: string, newStatus: string, isTask?: boolean) => {
    if (isTask) return updateTaskStatus(id, newStatus);
    return updateAppointmentStatus(id, newStatus);
  };

  const handleRescheduleAny = async (id: string, employeeId: string | null, newDate: Date, duration?: number, isTask?: boolean) => {
    if (isTask) {
      await handleRescheduleTask(id, employeeId, newDate, duration);
    } else {
      await handleRescheduleAppointment(id, employeeId, newDate, duration);
    }
  };

  const currentChecklistItem = checklistItem 
    ? appointments.find(a => a.id === checklistItem.id) ||
      workshopTasks.find(t => t.id === checklistItem.id) ||
      checklistItem
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black relative selection:bg-red-500/30 selection:text-white pb-32">
      <DashboardHeader 
        type="workshop" 
        profilePictureUrl={employeeProfile?.profilePictureUrl}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenWorkshopSettings={() => setIsWorkshopSettingsOpen(true)}
      />
      <main className="flex-1 overflow-y-auto relative z-10 scrollbar-hide pt-4">
         
         <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-8 animate-fade-in-up">
            
            <header className="space-y-6">
               {/* Fila Superior: Título y Botones Principales */}
               <div className="flex justify-between items-center border-b border-neutral-800/60 pb-6">
                  <div>
                    {isOwner && (
                      <Link 
                        to="/owner-dashboard" 
                        className="flex items-center gap-2 text-neutral-500 hover:text-white mb-2 text-[10px] font-black uppercase tracking-widest transition-all group w-fit"
                      >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Volver a Mis Talleres
                      </Link>
                    )}
                    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-[0.15em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                       {SECCIONES[activeTab]}
                    </h1>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button 
                      variant="secondary"
                      onClick={() => setIsAppModalOpen(true)}
                      className="!px-6 !py-4"
                    >
                      <Plus className="w-4 h-4 text-red-500" />
                      Nueva Cita
                    </Button>
                  </div>
               </div>

            </header>

            {/* Panel Tabs Wrapper */}
            <div className="max-w-[1400px] mx-auto pb-24 px-4 md:px-8 space-y-12">
              
              {/* TAB 1: RESUMEN */}
              {activeTab === 0 && (
                <div className="animate-fade-in-up">
                  <OverviewTab 
                    workshopData={workshopData} 
                    diasSemana={diasSemana} 
                    employeeProfile={employeeProfile}
                    userRole={userRole || undefined}
                  />
                </div>
              )}
              
              {/* TAB 1: AVISOS */}
              {activeTab === 1 && id && (
                <AvisosTab
                  workshopId={id}
                  appointments={appointments}
                  workshopTasks={delayedTasks}
                  readyJobs={readyForCompletion}
                  fetchWorkshopData={fetchWorkshopData}
                  onGoToPlanning={() => setActiveTab(3)}
                />
              )}

              {/* TAB 2: CITAS (Pendientes y Confirmadas) */}
              {activeTab === 2 && (
                <CitasTab
                  appointments={appointments}
                  pendingAppointments={pendingAppointments}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  goToNextPendingDate={goToNextPendingDate}
                  updateAppointmentStatus={updateAppointmentStatus}
                  handleDeleteAppointment={handleDeleteAppointment}
                  checkInVehicle={checkInVehicle}
                />
              )}

              {/* TAB 3: PLANIFICACIÓN */}
              {activeTab === 3 && (
                <Card
                  variant="neutral"
                  rounded="2xl"
                  padding="none"
                  className="bg-neutral-900/20 border-neutral-800/60 overflow-hidden"
                >
                  {/* Toolbar dentro del contenedor */}
                  <div className="flex flex-wrap items-center gap-4 p-5 border-b border-neutral-800/60">
                    <AppointmentSearch appointments={appointments} onSelectDate={setSelectedDate} />
                    <div className="h-10 w-[1px] bg-neutral-800/60 mx-1 hidden md:block"></div>
                    <MechanicSearch
                      mechanics={employees.filter(e => {
                        if (e.role === 'WORKSHOP_STAFF' || e.role === 'WORKSHOP_MANAGER') return true;
                        if (e.role === 'WORKSHOP_OWNER' && workshopData?.includeOwnerInPlanning) return true;
                        return false;
                      }) as any}
                      onSelectMechanic={() => {}}
                    />
                    <Button
                      variant="secondary"
                      onClick={goToNextUnassignedDate}
                      className="!px-5 !py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 border border-blue-600/20 hover:border-blue-500/40 group/btn"
                    >
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      Sin Asignar
                    </Button>
                    <div className="ml-auto">
                      <DateNavigator selectedDate={selectedDate} onChange={setSelectedDate} variant="red" />
                    </div>
                  </div>
                  <div className="p-5">
                    <AppointmentsTab
                      appointments={combinedPlanningItems}
                      selectedDate={selectedDate}
                      employees={employees}
                      openTime={workshopData?.openTime}
                      closeTime={workshopData?.closeTime}
                      onRescheduleTask={handleRescheduleAny}
                      onUpdateStatus={handleUpdateStatus}
                      onDeleteAppointment={handleDeleteAppointment}
                      onDeleteTask={handleDeleteTask}
                      onManage={setSelectedAppointment}
                      onViewChecklist={setChecklistItem}
                      includeOwnerInPlanning={workshopData?.includeOwnerInPlanning}
                    />
                  </div>
                </Card>
              )}

              {/* TAB 4: TRABAJOS */}
              {activeTab === 4 && (
                <Card
                  variant="neutral"
                  rounded="2xl"
                  padding="lg"
                  className="bg-neutral-900/20 border-neutral-800/60 overflow-hidden"
                >
                  <CompletedJobsTab
                    readyJobs={readyForCompletion}
                    onCompleteJob={(job) => setInvoicingJob(job)}
                    onMarkPickedUp={markPickedUp}
                  />
                </Card>
              )}

              {/* TAB 5: AGENDA (Timeline Individual de cualquier empleado) */}
              {activeTab === 5 && (
                <Card
                  variant="neutral"
                  rounded="2xl"
                  padding="none"
                  className="bg-neutral-900/20 border-neutral-800/60 overflow-hidden animate-fade-in-up"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-5 border-b border-neutral-800/60 gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                        <span className="text-green-500 text-[10px] font-black uppercase tracking-widest">Mi Agenda</span>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5">
                        <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Ver Agenda de:</span>
                        <select
                          value={selectedAgendaEmployeeId || ''}
                          onChange={(e) => setSelectedAgendaEmployeeId(e.target.value || null)}
                          className="bg-transparent text-white text-xs font-black uppercase tracking-wider focus:outline-none cursor-pointer border-none p-0 pr-6"
                        >
                          <option value={employeeProfile?.id || ''} className="bg-neutral-950 text-white">Mía ({employeeProfile?.firstname || 'Yo'})</option>
                          {employees
                            .filter(e => e.id !== employeeProfile?.id)
                            .filter(e => {
                              if (e.role === 'WORKSHOP_STAFF' || e.role === 'WORKSHOP_MANAGER') return true;
                              if (e.role === 'WORKSHOP_OWNER' && workshopData?.includeOwnerInPlanning) return true;
                              return false;
                            })
                            .map((emp: any) => (
                              <option key={emp.id} value={emp.id} className="bg-neutral-950 text-white">
                                {emp.firstname} {emp.lastname} ({emp.role === 'WORKSHOP_MANAGER' ? 'Gerente' : emp.role === 'WORKSHOP_OWNER' ? 'Propietario' : 'Mecánico'})
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                    
                    <DateNavigator selectedDate={selectedDate} onChange={setSelectedDate} variant="red" />
                  </div>
                  <div className="p-5">
                    <PlanningTimeline
                      columns={[{ 
                        id: selectedAgendaEmployeeId || '', 
                        title: selectedEmpObj ? `${selectedEmpObj.firstname} ${selectedEmpObj.lastname}` : 'Sin Asignar', 
                        employeeId: selectedAgendaEmployeeId,
                        role: selectedEmpObj ? (selectedEmpObj.role === 'WORKSHOP_OWNER' ? 'Dueño' : selectedEmpObj.role === 'WORKSHOP_MANAGER' ? 'Gerente' : 'Mecánico') : undefined,
                        profilePictureUrl: selectedEmpObj?.profilePictureUrl
                      }]}
                      appointments={agendaItems}
                      selectedDate={selectedDate}
                      openTime={workshopData?.openTime}
                      closeTime={workshopData?.closeTime}
                      onUpdateStatus={updateTaskStatus}
                      onDeleteTask={handleDeleteTask}
                      onDeleteAppointment={handleDeleteAppointment}
                      onRescheduleTask={handleRescheduleTask}
                      onManage={setSelectedAppointment}
                      onViewChecklist={setChecklistItem}
                      fillContainer
                      readOnly
                    />
                  </div>
                </Card>
              )}

              {/* TAB 6: TAREAS */}
              {activeTab === 6 && id && (
                <Card
                  variant="neutral"
                  rounded="2xl"
                  padding="lg"
                  className="bg-neutral-900/20 border-neutral-800/60 overflow-hidden"
                >
                  <TasksTab workshopId={id} />
                </Card>
              )}

              {/* TAB 7: ALMACÉN */}
              {activeTab === 7 && id && (
                <Card
                  variant="neutral"
                  rounded="2xl"
                  padding="lg"
                  className="bg-neutral-900/20 border-neutral-800/60 overflow-hidden"
                >
                  <PartsTab workshopId={id} />
                </Card>
              )}

              {/* TAB 8: INFORMES */}
              {activeTab === 8 && id && (
                <Card
                  variant="neutral"
                  rounded="2xl"
                  padding="lg"
                  className="bg-neutral-900/20 border-neutral-800/60 overflow-hidden"
                >
                  <ReportsTab workshopId={id} />
                </Card>
              )}

              {/* TAB 9: EQUIPO */}
              {activeTab === 9 && (
                <TeamTab 
                  employeeForm={employeeForm} 
                  setEmployeeForm={setEmployeeForm} 
                  onSubmit={handleEmployeeSubmit} 
                  onDelete={handleDeleteEmployee} 
                  onPromote={handlePromoteEmployee} 
                  onDemote={handleDemoteEmployee} 
                  employees={employees} 
                  onRefreshEmployees={fetchWorkshopData} 
                />
              )}
            </div>

         </div>
      </main>

      <BottomNav tabs={SECCIONES} activeTab={activeTab} onTabChange={setActiveTab} theme="workshop" />

      {id && (
        <StaffAppointmentModal 
          isOpen={isAppModalOpen}
          onClose={() => setIsAppModalOpen(false)}
          workshopId={id}
          onSuccess={() => { fetchWorkshopData(); setIsAppModalOpen(false); }}
        />
      )}

      {invoicingJob && (
        <GenerateInvoiceModal
          isOpen={invoicingJob !== null}
          onClose={() => setInvoicingJob(null)}
          job={invoicingJob}
          onSuccess={async () => {
            await completeJob(invoicingJob.id);
            setInvoicingJob(null);
          }}
        />
      )}

      {selectedAppointment && (
        <MechanicTaskModal
          isOpen={selectedAppointment !== null}
          onClose={() => setSelectedAppointment(null)}
          appointment={selectedAppointment}
          onSuccess={async () => {
            await fetchWorkshopData();
            setSelectedAppointment(null);
          }}
        />
      )}

      {checklistItem && (
        <TaskChecklistModal
          isOpen={checklistItem !== null}
          onClose={() => setChecklistItem(null)}
          item={currentChecklistItem}
          onUpdateStatus={async (id, status) => {
            await handleUpdateStatus(id, status, checklistItem.isTask);
          }}
          onSuccess={async () => {
            await fetchWorkshopData();
          }}
        />
      )}

      {/* MODAL DE MI PERFIL */}
      {employeeProfile && (
        <MiPerfil
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          employeeProfile={employeeProfile}
          profileForm={profileForm}
          setProfileForm={setProfileForm}
          onSubmit={async (form) => {
            await handleProfileUpdate(form);
          }}
          onUploadAvatar={handleUploadAvatar}
          onDeleteAvatar={handleDeleteAvatar}
          onPreviewImage={() => setIsPreviewOpen(true)}
        />
      )}

      {/* MODAL DE AJUSTES DEL TALLER */}
      <PerfilTaller
        isOpen={isWorkshopSettingsOpen && !!workshopData}
        onClose={() => setIsWorkshopSettingsOpen(false)}
        settingsForm={settingsForm}
        setSettingsForm={setSettingsForm}
        onSubmit={async (e) => {
          e.preventDefault();
          await handleSettingsSubmit(e);
          setIsWorkshopSettingsOpen(false);
        }}
        workshopLogoUrl={workshopData?.logoPictureUrl}
        onUploadLogo={handleUploadWorkshopLogo}
        onDeleteLogo={handleDeleteWorkshopLogo}
        onPreviewLogo={() => setIsLogoPreviewOpen(true)}
      />

      {isPreviewOpen && employeeProfile?.profilePictureUrl && (
        <ImagePreviewModal
          isOpen={isPreviewOpen}
          imageUrl={employeeProfile.profilePictureUrl}
          title={`${employeeProfile.firstname} ${employeeProfile.lastname}`}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}

      {isLogoPreviewOpen && workshopData?.logoPictureUrl && (
        <ImagePreviewModal
          isOpen={isLogoPreviewOpen}
          imageUrl={workshopData.logoPictureUrl}
          title={workshopData.companyName}
          onClose={() => setIsLogoPreviewOpen(false)}
        />
      )}

      <style>{`
        @keyframes fade-in-up {
           0% { opacity: 0; transform: translateY(20px); }
           100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
           animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
           opacity: 0;
         }
      `}</style>
    </div>
  );
}
