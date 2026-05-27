import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '@/components/layout/DashboardHeader/index';
import { BottomNav } from '@/components/layout/BottomNav/index';
import { LoadingScreen } from '@/components/common/LoadingScreen/index';
import { StaffAppointmentModal } from '@/features/appointments/components/StaffAppointmentModal/index';
import { DateNavigator } from '@/components/common/DateNavigator/index';
import { useWorkerDashboard } from '@/features/workshop/hooks/useWorkerDashboard';
import { PlanningTimeline } from '@/features/workshop/components/admin/tabs/AppointmentsTab/PlanningTimeline';
import { MechanicTaskModal } from '@/features/workshop/components/modals/MechanicTaskModal/index';
import { TaskChecklistModal } from '@/features/workshop/components/modals/TaskChecklistModal/index';
import { PartsTab } from '@/features/workshop/components/admin/tabs/PartsTab';
import { TasksTab } from '@/features/workshop/components/admin/tabs/TasksTab';
import { AvisosTab } from '@/features/workshop/components/admin/tabs/AvisosTab/AvisosTab';
import { AppointmentsTab } from '@/features/workshop/components/admin/tabs/AppointmentsTab';
import { CompletedJobsTab } from '@/features/workshop/components/admin/tabs/CompletedJobsTab';
import { CitasTab } from '@/features/workshop/components/admin/tabs/CitasTab';
import { AppointmentSearch } from '@/features/workshop/components/admin/AppointmentSearch/index';
import { MechanicSearch } from '@/features/workshop/components/admin/MechanicSearch/index';
import { GenerateInvoiceModal } from '@/features/workshop/components/modals/GenerateInvoiceModal/index';
import { OverviewTab } from '@/features/workshop/components/admin/tabs/OverviewTab/OverviewTab';
import { ImagePreviewModal } from '@/components/common/ImagePreviewModal/index';
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

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const { 
    loading, 
    employeeProfile, 
    appointments,
    workshopTasks,
    employees,
    fetchWorkerData, 
    updateAppointmentStatus, 
    updateTaskStatus,
    handleRescheduleAppointment,
    handleRescheduleTask,
    handleDeleteTask,
    handleDeleteAppointment,
    selectedDate,
    setSelectedDate,
    goToNextPendingDate,
    goToNextUnassignedDate,
    readyForCompletion,
    completeJob,
    markPickedUp,
    checkInVehicle,
    workshopData,
    handleProfileUpdate,
    handleUploadAvatar,
    handleDeleteAvatar
  } = useWorkerDashboard();


  const [activeTab, setActiveTab] = useState(0);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [checklistItem, setChecklistItem] = useState<any>(null);
  const [invoicingJob, setInvoicingJob] = useState<any>(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ firstname: '', lastname: '', address: '' });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Sync profile form when employeeProfile loads
  useEffect(() => {
    if (employeeProfile) {
      setProfileForm({
        firstname: employeeProfile.firstname || '',
        lastname: employeeProfile.lastname || '',
        address: employeeProfile.address || ''
      });
    }
  }, [employeeProfile]);

  const SECCIONES = ['RESUMEN', 'AGENDA'];
  const allowedSectionsStr = employeeProfile?.allowedSections;
  const allowed = allowedSectionsStr
    ? allowedSectionsStr.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  if (allowed.includes('PLANIFICACIÓN')) SECCIONES.push('PLANIFICACIÓN');
  if (allowed.includes('AVISOS')) SECCIONES.push('AVISOS');
  if (allowed.includes('CITAS')) SECCIONES.push('CITAS');
  if (allowed.includes('TAREAS')) SECCIONES.push('TAREAS');
  if (allowed.includes('ALMACÉN')) SECCIONES.push('ALMACÉN');
  if (allowed.includes('FACTURAS')) SECCIONES.push('FACTURAS');

  useEffect(() => {
    if (!loading && employeeProfile?.role === 'WORKSHOP_MANAGER') {
      navigate(`/workshop/${employeeProfile.workshopId}`);
    }
  }, [loading, employeeProfile, navigate]);

  if (loading || employeeProfile?.role === 'WORKSHOP_MANAGER') {
    return <LoadingScreen message="Sincronizando panel..." theme="workshop" />;
  }



  // Función para chequear si una fecha coincide con selectedDate
  const isSameDate = (isoString: string) => {
      const appDate = new Date(isoString);
      return appDate.getFullYear() === selectedDate.getFullYear() &&
             appDate.getMonth() === selectedDate.getMonth() &&
             appDate.getDate() === selectedDate.getDate();
  };

  // MERGE appointments and workshopTasks for the timeline (Plannable Items)
  const combinedPlanningItems = [
      ...appointments.filter(a => a.status !== 'PENDING' && a.status !== 'IN_PROGRESS' && a.status !== 'COMPLETED' && a.status !== 'CANCELLED' && a.status !== 'PICKED_UP' && isSameDate(a.dateTime)),
      ...workshopTasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && t.status !== 'PICKED_UP').map(t => ({ ...t, isTask: true }))
  ];



  const handleUpdateStatus = (id: string, newStatus: string, isTask?: boolean) => {
    if (isTask) return updateTaskStatus(id, newStatus);
    return updateAppointmentStatus(id, newStatus);
  };

  const handleRescheduleAny = (id: string, employeeId: string | null, newDate: Date, duration?: number, isTask?: boolean) => {
    if (isTask) return handleRescheduleTask(id, employeeId, newDate, duration);
    return handleRescheduleAppointment(id, employeeId, newDate, duration);
  };

  const handleManageAppointment = (app: any) => setSelectedAppointment(app);
  const handleViewChecklist = (app: any) => setChecklistItem(app);
  const currentChecklistItem = checklistItem 
    ? appointments.find(a => a.id === checklistItem.id) ||
      workshopTasks.find(t => t.id === checklistItem.id) ||
      checklistItem
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black relative selection:bg-red-500/30 selection:text-white pb-32">
      
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] -z-10 mix-blend-screen animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-neutral-600/10 rounded-full blur-[120px] -z-10 mix-blend-screen animate-[pulse_4s_infinite] pointer-events-none"></div>

      <DashboardHeader 
        type="workshop" 
        profilePictureUrl={employeeProfile?.profilePictureUrl}
        onOpenProfile={() => setIsProfileOpen(true)}
      />
      <main className="flex-1 overflow-y-auto relative z-10 scrollbar-hide pt-4">

         <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-8 animate-fade-in-up">
            
            <header className="space-y-6">
               {/* Fila Superior: Título y Botones Principales */}
               <div className="flex justify-between items-center border-b border-neutral-800/60 pb-6">
                  <div>
                     <h1 className="text-3xl md:text-4xl font-black uppercase tracking-[0.15em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                        {SECCIONES[activeTab]}
                     </h1>
                  </div>
                  
                  <div className="flex items-center gap-4">
                     <button 
                       onClick={() => setIsAppModalOpen(true)}
                       className="px-6 h-[54px] bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
                     >
                       <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                       Nueva Cita
                     </button>
                  </div>
               </div>

            </header>

            <div className="relative z-0">
              {/* TAB: RESUMEN (Siempre fijo para Mecánicos) */}
              {SECCIONES[activeTab] === 'RESUMEN' && (
                <OverviewTab 
                  workshopData={workshopData} 
                  diasSemana={diasSemana} 
                  employeeProfile={employeeProfile}
                  userRole={employeeProfile?.role}
                />
              )}

              {/* TAB: AGENDA (Mi Agenda Personal / Timeline - Siempre fija para Mecánicos) */}
              {SECCIONES[activeTab] === 'AGENDA' && (
                  <div className="bg-neutral-900/20 rounded-[2rem] border border-neutral-800/60 overflow-hidden animate-fade-in-up">
                    <div className="flex items-center justify-between p-5 border-b border-neutral-800/60">
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Mi Agenda</span>
                      </div>
                      <DateNavigator selectedDate={selectedDate} onChange={setSelectedDate} variant="blue" />
                    </div>
                    <div className="p-0">
                       <PlanningTimeline
                         columns={[{ 
                           id: employeeProfile?.id || '', 
                           title: 'MI AGENDA', 
                           employeeId: employeeProfile?.id || '',
                           role: employeeProfile?.role === 'WORKSHOP_OWNER' ? 'Dueño' : employeeProfile?.role === 'WORKSHOP_MANAGER' ? 'Gerente' : 'Mecánico',
                           profilePictureUrl: employeeProfile?.profilePictureUrl
                         }]}
                         appointments={combinedPlanningItems}
                         selectedDate={selectedDate}
                         onUpdateStatus={handleUpdateStatus}
                         onDeleteTask={handleDeleteTask}
                         onDeleteAppointment={handleDeleteAppointment}
                         onRescheduleTask={handleRescheduleAny}
                         onManage={handleManageAppointment}
                         onViewChecklist={handleViewChecklist}
                         fillContainer
                         readOnly
                       />
                    </div>
                  </div>
              )}

              {/* TAB: PLANIFICACIÓN (Habilitable opcionalmente - Como el Gerente) */}
              {SECCIONES[activeTab] === 'PLANIFICACIÓN' && (
                <div className="bg-neutral-900/20 rounded-[2rem] border border-neutral-800/60 overflow-hidden animate-fade-in-up">
                  {/* Toolbar dentro del contenedor */}
                  <div className="flex flex-wrap items-center gap-4 p-5 border-b border-neutral-800/60">
                    <AppointmentSearch appointments={appointments} onSelectDate={setSelectedDate} />
                    <div className="h-10 w-[1px] bg-neutral-800/60 mx-1 hidden md:block"></div>
                    <MechanicSearch
                      mechanics={employees.filter(e => {
                        if (e.role === 'WORKSHOP_STAFF' || e.role === 'WORKSHOP_MANAGER') return true;
                        if (e.role === 'WORKSHOP_OWNER' && workshopData?.includeOwnerInPlanning) return true;
                        return false;
                      })}
                      onSelectMechanic={() => {}}
                    />
                    <button
                      onClick={goToNextUnassignedDate}
                      className="px-5 h-[46px] bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 border border-blue-600/20 hover:border-blue-500/40 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 group/btn"
                    >
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      Sin Asignar
                    </button>
                    <div className="ml-auto">
                      <DateNavigator selectedDate={selectedDate} onChange={setSelectedDate} variant="blue" />
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
                </div>
              )}

              {/* TAB: AVISOS (Habilitable opcionalmente - Como el Gerente) */}
              {SECCIONES[activeTab] === 'AVISOS' && employeeProfile?.workshopId && (
                <AvisosTab
                  workshopId={employeeProfile.workshopId}
                  appointments={appointments}
                  readyJobs={readyForCompletion}
                  fetchWorkshopData={fetchWorkerData}
                />
              )}

              {/* TAB: CITAS (Habilitable opcionalmente - Como el Gerente) */}
              {SECCIONES[activeTab] === 'CITAS' && (
                <CitasTab
                  appointments={appointments}
                  pendingAppointments={appointments.filter(a => a.status === 'PENDING')}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  goToNextPendingDate={goToNextPendingDate}
                  updateAppointmentStatus={updateAppointmentStatus}
                  handleDeleteAppointment={handleDeleteAppointment}
                  checkInVehicle={checkInVehicle}
                />
              )}

              {/* TAB: TAREAS (Habilitable opcionalmente - Como el Gerente) */}
              {SECCIONES[activeTab] === 'TAREAS' && employeeProfile?.workshopId && (
                <div className="bg-neutral-900/20 rounded-[2rem] border border-neutral-800/60 overflow-hidden p-6 animate-fade-in-up">
                  <TasksTab workshopId={employeeProfile.workshopId} />
                </div>
              )}

              {/* TAB: ALMACÉN (Habilitable opcionalmente - Como el Gerente) */}
              {SECCIONES[activeTab] === 'ALMACÉN' && employeeProfile?.workshopId && (
                <div className="bg-neutral-900/20 rounded-[2rem] border border-neutral-800/60 overflow-hidden p-6 animate-fade-in-up">
                  <PartsTab workshopId={employeeProfile.workshopId} />
                </div>
              )}

              {/* TAB: FACTURAS (Habilitable opcionalmente - Como el Gerente) */}
              {SECCIONES[activeTab] === 'FACTURAS' && (
                <div className="bg-neutral-900/20 rounded-[2rem] border border-neutral-800/60 overflow-hidden p-6 animate-fade-in-up">
                  <CompletedJobsTab
                    readyJobs={readyForCompletion}
                    onCompleteJob={(job) => setInvoicingJob(job)}
                    onMarkPickedUp={markPickedUp}
                  />
                </div>
              )}



            </div>
            
         </div>
      </main>

      {/* --- FLOATING BOTTOM NAV --- */}
      <BottomNav tabs={SECCIONES} activeTab={activeTab} onTabChange={setActiveTab} theme="workshop" />

      {employeeProfile?.workshopId && (
        <StaffAppointmentModal 
          isOpen={isAppModalOpen}
          onClose={() => setIsAppModalOpen(false)}
          workshopId={employeeProfile.workshopId}
          onSuccess={() => { fetchWorkerData(); setIsAppModalOpen(false); }}
        />
      )}

      {selectedAppointment && (
        <MechanicTaskModal
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          appointment={selectedAppointment}
          onSuccess={() => { fetchWorkerData(); setSelectedAppointment(null); }}
        />
      )}

      {checklistItem && (
        <TaskChecklistModal
          isOpen={!!checklistItem}
          onClose={() => { setChecklistItem(null); fetchWorkerData(); }}
          item={currentChecklistItem}
          onUpdateStatus={handleUpdateStatus}
          onSuccess={() => { fetchWorkerData(); }}
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

      {isPreviewOpen && employeeProfile?.profilePictureUrl && (
        <ImagePreviewModal
          isOpen={isPreviewOpen}
          imageUrl={employeeProfile.profilePictureUrl}
          title={`${employeeProfile.firstname} ${employeeProfile.lastname}`}
          onClose={() => setIsPreviewOpen(false)}
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
