import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '../components/layout/DashboardHeader/index';
import { BottomNav } from '../components/layout/BottomNav/index';
import { LoadingScreen } from '../components/common/LoadingScreen/index';
import { StaffAppointmentModal } from '../components/features/workshop/StaffAppointmentModal/index';
import { MechanicLiveTask } from '../components/features/workshop/MechanicLiveTask/index';
import { DateNavigator } from '../components/common/DateNavigator/index';
import { AppointmentSearch } from '../components/features/workshop/admin/components/AppointmentSearch/index';
import { MechanicSearch } from '../components/features/workshop/admin/components/MechanicSearch/index';
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
    goToNextUnassignedDate
  } = useWorkerDashboard();
  const [activeTab, setActiveTab] = useState(0);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [checklistItem, setChecklistItem] = useState<any>(null);

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

  if (loading) {
    return <LoadingScreen message="Sincronizando panel..." theme="workshop" />;
  }

  const isManager = employeeProfile?.role === 'WORKSHOP_MANAGER';
  // Manager tiene acceso a su agenda personal + la planificación del taller
  const SECCIONES = isManager
    ? ['RESUMEN', 'CITAS', 'PLANIFICACIÓN', 'AGENDA']
    : ['RESUMEN', 'CITAS', 'AGENDA'];

  // Función para chequear si una fecha coindice con selectedDate
  const isSameDate = (isoString: string) => {
      const appDate = new Date(isoString);
      return appDate.getFullYear() === selectedDate.getFullYear() &&
             appDate.getMonth() === selectedDate.getMonth() &&
             appDate.getDate() === selectedDate.getDate();
  };

  // Citas Pendientes de Confirmar (Solo Manager) filtradas por selectedDate
  const pendingAppointments = appointments.filter(a => a.status === 'PENDING' && isSameDate(a.dateTime));
  
  // MERGE appointments and workshopTasks for the timeline (Plannable Items)
  // Excluimos IN_PROGRESS de appointments porque ya tienen tareas (WorkshopTasks) que las representan
  const combinedPlanningItems = [
      ...appointments.filter(a => a.status !== 'PENDING' && a.status !== 'IN_PROGRESS' && a.status !== 'COMPLETED' && a.status !== 'CANCELLED' && isSameDate(a.dateTime)),
      ...workshopTasks.map(t => ({ ...t, isTask: true }))
  ];

  // Mis Citas Activas (Para MechanicLiveTask) filtradas por selectedDate
  const myWorkItems = [
      ...appointments.filter(a => a.assignedEmployeeId === employeeProfile?.id && a.status !== 'IN_PROGRESS' && a.status !== 'COMPLETED' && a.status !== 'CANCELLED' && isSameDate(a.dateTime)),
      ...workshopTasks.filter(t => t.assignedEmployeeId === employeeProfile?.id && t.status !== 'COMPLETED' && t.status !== 'CANCELLED')
  ];

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

                     {isManager && (
                       <button 
                           onClick={() => navigate(`/workshop/${employeeProfile.workshopId}`)} 
                           className="px-6 h-[54px] bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                       >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                           Ajustes Taller
                       </button>
                     )}
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
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mt-2 ${isManager ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isManager ? 'bg-red-400' : 'bg-blue-400'} animate-pulse`}></span>
                        {isManager ? 'Encargado' : 'Mecánico'}
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

              {/* TAB 1: CITAS (Pendientes & Mis Tareas) */}
              {activeTab === 1 && (
                  <div className="space-y-12">
                    {/* Sección Manager: Confirmar Pendientes */}
                    {isManager && (
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
                        </div>
                    )}

                    {/* Mis Tareas Hoy — solo para mecánicos, no para manager */}
                    {!isManager && (
                      <div>
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full w-fit">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                  <span className="text-green-500 text-[10px] font-black uppercase tracking-widest">Mis Tareas</span>
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
                                        />
                                  ))
                              ) : (
                                  <div className="col-span-full py-20 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                                      <p className="text-neutral-500 font-medium uppercase tracking-widest text-sm">No tienes tareas activas asignadas</p>
                                  </div>
                              )}
                          </div>
                      </div>
                    )}
                  </div>
              )}

              {/* TAB 3 (Manager): AGENDA PERSONAL */}
              {isManager && activeTab === 3 && (
                  <div className="bg-neutral-900/20 rounded-[2rem] border border-neutral-800/60 overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-neutral-800/60">
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-500 text-[10px] font-black uppercase tracking-widest">Mi Agenda</span>
                      </div>
                      <DateNavigator selectedDate={selectedDate} onChange={setSelectedDate} variant="red" />
                    </div>
                    <div className="p-5">
                      <PlanningTimeline
                        columns={[{ id: employeeProfile?.id, title: `${employeeProfile?.firstname} ${employeeProfile?.lastname}`, employeeId: employeeProfile?.id }]}
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

              {/* TAB 2 (Manager): PLANIFICACIÓN TIMELINE */}
              {activeTab === 2 && isManager && (
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
                      <PlanningTimeline
                        columns={[
                          { id: 'unassigned', title: 'SIN ASIGNAR', employeeId: null },
                          ...employees.filter(e => e.role === 'WORKSHOP_STAFF' || e.role === 'WORKSHOP_MANAGER').map(m => ({
                            id: m.id,
                            title: `${m.firstname} ${m.lastname}`,
                            employeeId: m.id
                          }))
                        ]}
                        appointments={combinedPlanningItems}
                        selectedDate={selectedDate}
                        onRescheduleTask={handleRescheduleAny}
                        onUpdateStatus={handleUpdateStatus}
                        onDeleteTask={handleDeleteTask}
                        onDeleteAppointment={handleDeleteAppointment}
                        onManage={handleManageAppointment}
                        onViewChecklist={handleViewChecklist}
                        columnWidth="260px"
                      />
                    </div>
                  </div>
              )}

              {/* TAB 2 (Mecánico): AGENDA PERSONAL (Timeline) */}
              {activeTab === 2 && !isManager && (
                  <div className="bg-neutral-900/20 rounded-[2rem] border border-neutral-800/60 overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-neutral-800/60">
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Mi Agenda</span>
                      </div>
                      <DateNavigator selectedDate={selectedDate} onChange={setSelectedDate} variant="blue" />
                    </div>
                    <div className="p-0">
                       <PlanningTimeline
                         columns={[{ id: employeeProfile?.id, title: 'MI AGENDA', employeeId: employeeProfile?.id }]}
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

      <StaffAppointmentModal 
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        workshopId={employeeProfile?.workshopId}
        onSuccess={() => { fetchWorkerData(); setIsAppModalOpen(false); }}
      />

      {/* Modal de Gestión de Tareas del Mecánico */}
      {selectedAppointment && (
        <MechanicTaskModal
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          appointment={selectedAppointment}
          onSuccess={() => { fetchWorkerData(); setSelectedAppointment(null); }}
        />
      )}

      {/* Modal de Checklist de Tareas */}
      {checklistItem && (
        <TaskChecklistModal
          isOpen={!!checklistItem}
          onClose={() => { setChecklistItem(null); fetchWorkerData(); }}
          item={checklistItem}
          onUpdateStatus={handleUpdateStatus}
          onSuccess={() => { fetchWorkerData(); setChecklistItem(null); }}
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
