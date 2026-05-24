import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GenerateInvoiceModal } from '../components/features/workshop/GenerateInvoiceModal/index';
import { DashboardHeader } from '../components/layout/DashboardHeader/index';
import { BottomNav } from '../components/layout/BottomNav/index';
import { StaffAppointmentModal } from '../components/features/workshop/StaffAppointmentModal/index';
import { useWorkshopAdmin } from '../hooks/useWorkshopAdmin';
import { OverviewTab } from '../components/features/workshop/admin/tabs/OverviewTab';
import { AppointmentsTab } from '../components/features/workshop/admin/tabs/AppointmentsTab';
import { SettingsTab } from '../components/features/workshop/admin/tabs/SettingsTab';
import { TeamTab } from '../components/features/workshop/admin/tabs/TeamTab';
import { CompletedJobsTab } from '../components/features/workshop/admin/tabs/CompletedJobsTab';
import { TasksTab } from '../components/features/workshop/admin/tabs/TasksTab';
import { ReportsTab } from '../components/features/workshop/admin/tabs/ReportsTab';
import { DateNavigator } from '../components/common/DateNavigator/index';
import { AppointmentSearch } from '../components/features/workshop/admin/components/AppointmentSearch/index';
import { MechanicSearch } from '../components/features/workshop/admin/components/MechanicSearch/index';
import { ConfirmedAppointmentsList } from '../components/features/workshop/admin/components/ConfirmedAppointmentsList';
import { PlanningTimeline } from '../components/features/workshop/admin/tabs/PlanningTimeline';
import { TaskChecklistModal } from '../components/features/workshop/TaskChecklistModal/index';
import { MechanicTaskModal } from '../components/features/workshop/MechanicTaskModal/index';

const diasSemana = [
  { value: 'LUNES', label: 'Lunes' },
  { value: 'MARTES', label: 'Martes' },
  { value: 'MIERCOLES', label: 'Miércoles' },
  { value: 'JUEVES', label: 'Jueves' },
  { value: 'VIERNES', label: 'Viernes' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' },
];

export default function WorkshopAdminDashboard() {
  const [invoicingJob, setInvoicingJob] = useState<any | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [checklistItem, setChecklistItem] = useState<any>(null);
  const [selectedAgendaEmployeeId, setSelectedAgendaEmployeeId] = useState<string | null>(null);

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
    readyForCompletion,
    goToNextUnassignedDate,
    goToNextPendingDate,
    employeeProfile,
    workshopTasks,
    userRole
  } = useWorkshopAdmin();

  useEffect(() => {
    if (employeeProfile?.id && !selectedAgendaEmployeeId) {
      setSelectedAgendaEmployeeId(employeeProfile.id);
    }
  }, [employeeProfile, selectedAgendaEmployeeId]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
       <div className="w-16 h-16 border-t-2 border-red-600 rounded-full animate-spin"></div>
    </div>
  );

  const isOwner = userRole === 'WORKSHOP_OWNER';
  const SECCIONES = isOwner
    ? ['RESUMEN', 'CITAS', 'PLANIFICACIÓN', 'TRABAJOS', 'AGENDA', 'TAREAS', 'INFORMES', 'AJUSTES', 'EQUIPO']
    : ['RESUMEN', 'CITAS', 'PLANIFICACIÓN', 'TRABAJOS', 'AGENDA', 'TAREAS', 'INFORMES', 'AJUSTES'];

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
      <DashboardHeader type="workshop" />
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
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Volver a Mis Talleres
                      </Link>
                    )}
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
              {activeTab === 0 && <OverviewTab workshopData={workshopData} diasSemana={diasSemana} />}
              
              {/* TAB 1: CITAS (Pendientes y Confirmadas) */}
              {activeTab === 1 && (
                <div className="space-y-12 animate-fade-in-up">
                  <div className="bg-neutral-900/30 border border-neutral-800/60 rounded-[2rem] p-8">
                    {/* Toolbar: Pendientes + Calendario */}
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                      <AppointmentSearch appointments={appointments} onSelectDate={setSelectedDate} />
                      <button
                        onClick={goToNextPendingDate}
                        className="px-5 h-[46px] bg-yellow-600/10 hover:bg-yellow-600/20 text-yellow-500 border border-yellow-600/20 hover:border-yellow-500/40 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 group/btn"
                      >
                        <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                        Pendientes
                      </button>
                      <div className="ml-auto">
                        <DateNavigator selectedDate={selectedDate} onChange={setSelectedDate} variant="red" />
                      </div>
                    </div>

                    <h3 className="text-white font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      Pendientes de Confirmar
                      <span className="bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full text-[10px]">{pendingAppointments.length}</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pendingAppointments.length > 0 ? pendingAppointments.map((app: any) => (
                        <div key={app.id} className="bg-black/40 p-5 rounded-2xl border border-neutral-800 flex flex-col justify-between">
                          <div>
                            <div className="text-[10px] font-black uppercase text-yellow-500 tracking-widest mb-1">{app.serviceType}</div>
                            <div className="text-lg font-black text-white">{app.vehicleDisplay}</div>
                            <div className="text-neutral-400 text-xs font-mono mb-4">{new Date(app.dateTime).toLocaleDateString([], { day: '2-digit', month: '2-digit' })} {new Date(app.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} h</div>
                          </div>
                          <button 
                            onClick={() => updateAppointmentStatus(app.id, 'CONFIRMED')}
                            className="w-full py-2.5 bg-white text-black hover:bg-neutral-200 rounded-xl font-black uppercase tracking-widest text-[10px] transition-colors"
                          >
                            Confirmar Cita
                          </button>
                        </div>
                      )) : (
                        <div className="col-span-full py-8 text-center text-neutral-500 text-xs uppercase tracking-widest font-bold">
                          Todo al día. No hay citas por confirmar.
                        </div>
                      )}
                    </div>
                    
                    {pendingAppointments.length > 0 && (
                      <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-6 text-center">
                        Las citas confirmadas se moverán a la pestaña "Planificación" para ser asignadas.
                      </p>
                    )}
                    
                    <ConfirmedAppointmentsList 
                      appointments={appointments} 
                      onDeleteAppointment={handleDeleteAppointment} 
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: PLANIFICACIÓN */}
              {activeTab === 2 && (
                <div className="bg-neutral-900/20 rounded-[2rem] border border-neutral-800/60 overflow-hidden">
                  {/* Toolbar dentro del contenedor */}
                  <div className="flex flex-wrap items-center gap-4 p-5 border-b border-neutral-800/60">
                    <AppointmentSearch appointments={appointments} onSelectDate={setSelectedDate} />
                    <div className="h-10 w-[1px] bg-neutral-800/60 mx-1 hidden md:block"></div>
                    <MechanicSearch
                      mechanics={employees.filter(e => e.role === 'WORKSHOP_STAFF' || e.role === 'WORKSHOP_MANAGER')}
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
                      onManage={setSelectedAppointment}
                      onViewChecklist={setChecklistItem}
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: TRABAJOS */}
              {activeTab === 3 && (
                <div className="bg-neutral-900/20 rounded-[2rem] border border-neutral-800/60 overflow-hidden p-6">
                  <CompletedJobsTab
                    readyJobs={readyForCompletion}
                    onCompleteJob={(job) => setInvoicingJob(job)}
                    onMarkPickedUp={markPickedUp}
                  />
                </div>
              )}

              {/* TAB 4: AGENDA (Timeline Individual de cualquier empleado) */}
              {activeTab === 4 && (
                <div className="bg-neutral-900/20 rounded-[2rem] border border-neutral-800/60 overflow-hidden animate-fade-in-up">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-5 border-b border-neutral-800/60 gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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
                          {employees.filter(e => e.id !== employeeProfile?.id).map((emp: any) => (
                            <option key={emp.id} value={emp.id} className="bg-neutral-950 text-white">
                              {emp.firstname} {emp.lastname} ({emp.role === 'WORKSHOP_MANAGER' ? 'Gerente' : 'Mecánico'})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <DateNavigator selectedDate={selectedDate} onChange={setSelectedDate} variant="red" />
                  </div>
                  <div className="p-5">
                    <PlanningTimeline
                      columns={[{ id: selectedAgendaEmployeeId || '', title: selectedEmpObj ? `${selectedEmpObj.firstname} ${selectedEmpObj.lastname}` : 'Sin Asignar', employeeId: selectedAgendaEmployeeId }]}
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
                </div>
              )}

              {/* TAB 5: TAREAS */}
              {activeTab === 5 && id && (
                <div className="bg-neutral-900/20 rounded-[2rem] border border-neutral-800/60 overflow-hidden p-6">
                  <TasksTab workshopId={id} />
                </div>
              )}

              {/* TAB 6: INFORMES */}
              {activeTab === 6 && id && (
                <div className="bg-neutral-900/20 rounded-[2rem] border border-neutral-800/60 overflow-hidden p-6">
                  <ReportsTab workshopId={id} />
                </div>
              )}

              {/* TAB 7: AJUSTES */}
              {activeTab === 7 && <SettingsTab settingsForm={settingsForm} setSettingsForm={setSettingsForm} onSubmit={handleSettingsSubmit} diasSemana={diasSemana} />}

              {/* TAB 8: EQUIPO */}
              {activeTab === 8 && <TeamTab employeeForm={employeeForm} setEmployeeForm={setEmployeeForm} onSubmit={handleEmployeeSubmit} onDelete={handleDeleteEmployee} onPromote={handlePromoteEmployee} onDemote={handleDemoteEmployee} employees={employees} />}
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
