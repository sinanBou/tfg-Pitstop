import { useState } from 'react';
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

const SECCIONES = ['RESUMEN', 'PLANIFICACIÓN', 'TRABAJOS', 'TAREAS', 'INFORMES', 'AJUSTES', 'EQUIPO'];

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
    handleDeleteAppointment,
    completeJob,
    markPickedUp,
    readyForCompletion,
    goToNextUnassignedDate,
    userRole
  } = useWorkshopAdmin();

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
       <div className="w-16 h-16 border-t-2 border-red-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black relative selection:bg-red-500/30 selection:text-white pb-32">
      <DashboardHeader type="workshop" />
      <main className="flex-1 overflow-y-auto relative z-10 scrollbar-hide pt-4">
         
         <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-8 animate-fade-in-up">
            
            <header className="space-y-6">
               {/* Fila Superior: Título y Botones Principales */}
               <div className="flex justify-between items-center border-b border-neutral-800/60 pb-6">
                  <div>
                    <Link 
                      to={userRole === 'WORKSHOP_OWNER' ? "/owner-dashboard" : "/worker-dashboard"} 
                      className="flex items-center gap-2 text-neutral-500 hover:text-white mb-2 text-[10px] font-black uppercase tracking-widest transition-all group w-fit"
                    >
                      <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                      {userRole === 'WORKSHOP_OWNER' ? 'Volver a Mis Talleres' : 'Volver a Mi Panel'}
                    </Link>
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
              {activeTab === 1 && (
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
                      appointments={appointments.filter(a => a.status !== 'PENDING' && a.status !== 'PICKED_UP')}
                      selectedDate={selectedDate}
                      employees={employees}
                      openTime={workshopData?.openTime}
                      closeTime={workshopData?.closeTime}
                      onRescheduleTask={handleRescheduleAppointment}
                      onUpdateStatus={updateAppointmentStatus}
                      onDeleteAppointment={handleDeleteAppointment}
                    />
                  </div>
                </div>
              )}
              {activeTab === 2 && (
                <div className="bg-neutral-900/20 rounded-[2rem] border border-neutral-800/60 overflow-hidden p-6">
                  <CompletedJobsTab
                    readyJobs={readyForCompletion}
                    onCompleteJob={(job) => setInvoicingJob(job)}
                    onMarkPickedUp={markPickedUp}
                  />
                </div>
              )}
              {activeTab === 3 && id && (
                <div className="bg-neutral-900/20 rounded-[2rem] border border-neutral-800/60 overflow-hidden p-6">
                  <TasksTab workshopId={id} />
                </div>
              )}
              {activeTab === 4 && id && (
                <div className="bg-neutral-900/20 rounded-[2rem] border border-neutral-800/60 overflow-hidden p-6">
                  <ReportsTab workshopId={id} />
                </div>
              )}
              {activeTab === 5 && <SettingsTab settingsForm={settingsForm} setSettingsForm={setSettingsForm} onSubmit={handleSettingsSubmit} diasSemana={diasSemana} />}
              {activeTab === 6 && <TeamTab employeeForm={employeeForm} setEmployeeForm={setEmployeeForm} onSubmit={handleEmployeeSubmit} onDelete={handleDeleteEmployee} onPromote={handlePromoteEmployee} onDemote={handleDemoteEmployee} employees={employees} />}
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
