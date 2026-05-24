import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '../components/layout/DashboardHeader/index';
import { BottomNav } from '../components/layout/BottomNav/index';
import { LoadingScreen } from '../components/common/LoadingScreen/index';
import { StaffAppointmentModal } from '../components/features/workshop/StaffAppointmentModal/index';
import { MechanicLiveTask } from '../components/features/workshop/MechanicLiveTask/index';
import { DateNavigator } from '../components/common/DateNavigator/index';
import { useWorkerDashboard } from '../hooks/useWorkerDashboard';
import { PlanningTimeline } from '../components/features/workshop/admin/tabs/PlanningTimeline';
import { MechanicTaskModal } from '../components/features/workshop/MechanicTaskModal/index';
import { TaskChecklistModal } from '../components/features/workshop/TaskChecklistModal/index';

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const { 
    loading, 
    employeeProfile, 
    appointments,
    workshopTasks,
    fetchWorkerData, 
    updateAppointmentStatus, 
    updateTaskStatus,
    handleRescheduleAppointment,
    handleRescheduleTask,
    handleDeleteTask,
    handleDeleteAppointment,
    selectedDate,
    setSelectedDate
  } = useWorkerDashboard();
  const [activeTab, setActiveTab] = useState(0);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [checklistItem, setChecklistItem] = useState<any>(null);

  useEffect(() => {
    if (!loading && employeeProfile?.role === 'WORKSHOP_MANAGER') {
      navigate(`/workshop/${employeeProfile.workshopId}`);
    }
  }, [loading, employeeProfile, navigate]);

  if (loading || employeeProfile?.role === 'WORKSHOP_MANAGER') {
    return <LoadingScreen message="Sincronizando panel..." theme="workshop" />;
  }

  const SECCIONES = ['RESUMEN', 'CITAS', 'AGENDA'];

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

  // Mis Citas Activas (Para MechanicLiveTask)
  const myWorkItems = [
      ...appointments.filter(a => a.assignedEmployeeId === employeeProfile?.id && a.status !== 'IN_PROGRESS' && a.status !== 'COMPLETED' && a.status !== 'CANCELLED' && a.status !== 'PICKED_UP' && isSameDate(a.dateTime)),
      ...workshopTasks.filter(t => t.assignedEmployeeId === employeeProfile?.id && t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && t.status !== 'PICKED_UP')
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

      <DashboardHeader type="workshop" />
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
              {/* TAB 0: RESUMEN */}
              {activeTab === 0 && (
                  <div className="space-y-8">
                    {/* Tarjeta de Bienvenida */}
                    <div className="bg-neutral-900/40 border border-neutral-800 rounded-[2rem] p-8 backdrop-blur-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                        <svg className="w-32 h-32 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-2">Bienvenido de nuevo</p>
                      <h2 className="text-3xl font-black text-white mb-1">
                        {employeeProfile?.firstname} {employeeProfile?.lastname}
                      </h2>
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mt-2 bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                        Mecánico de Plantilla
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <div className="bg-neutral-900/40 border border-neutral-800 rounded-[2rem] p-8 hover:border-red-500/30 transition-all group relative overflow-hidden backdrop-blur-sm">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <h3 className="text-white font-black uppercase text-sm tracking-widest mb-6 flex items-center gap-3">
                          <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                          Próximas Citas
                        </h3>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {appointments.length > 0 ? appointments.filter((a: any) => a.status === 'PENDING' || a.status === 'CONFIRMED').map((app: any) => (
                              <div key={app.id} className="p-4 bg-black/40 border border-neutral-800 rounded-2xl hover:border-neutral-700 transition-colors">
                                <p className="text-white font-black text-xs uppercase mb-1">{app.serviceType}</p>
                                <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
                                    <span>{new Date(app.dateTime).toLocaleDateString()}</span>
                                    <span className="text-red-500">{new Date(app.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})} h</span>
                                </div>
                              </div>
                          )) : <p className="text-neutral-500 text-xs italic">No hay citas pendientes.</p>}
                        </div>
                      </div>
                    </div>
                  </div>
              )}

              {/* TAB 1: CITAS (Mis Tareas) */}
              {activeTab === 1 && (
                  <div className="space-y-12 animate-fade-in-up">
                      <div>
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full w-fit">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                  <span className="text-green-500 text-[10px] font-black uppercase tracking-widest">Mis Tareas Hoy</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <DateNavigator selectedDate={selectedDate} onChange={setSelectedDate} variant="blue" />
                              </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {myWorkItems.length > 0 ? (
                                  myWorkItems
                                  .sort((a, b) => {
                                      if (a.status === 'IN_PROGRESS') return -1;
                                      if (b.status === 'IN_PROGRESS') return 1;
                                      return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
                                  })
                                  .map((item: any) => (
                                        <MechanicLiveTask 
                                            key={item.id} 
                                            appointment={item} 
                                            onUpdateStatus={(id, status) => handleUpdateStatus(id, status, item.isTask)}
                                            onViewChecklist={handleViewChecklist}
                                        />
                                  ))
                              ) : (
                                  <div className="col-span-full py-20 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                                      <p className="text-neutral-500 font-medium uppercase tracking-widest text-sm">No tienes tareas activas asignadas para hoy</p>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              )}

              {/* TAB 2: MI AGENDA PERSONAL (Timeline) */}
              {activeTab === 2 && (
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
                         columns={[{ id: employeeProfile?.id || '', title: 'MI AGENDA', employeeId: employeeProfile?.id || '' }]}
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
