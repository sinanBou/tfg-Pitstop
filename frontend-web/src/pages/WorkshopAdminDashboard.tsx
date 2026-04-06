import { Link } from 'react-router-dom';
import { DashboardHeader } from '../components/layout/DashboardHeader/index';
import { BottomNav } from '../components/layout/BottomNav/index';
import { StaffAppointmentModal } from '../components/features/workshop/StaffAppointmentModal/index';
import { useWorkshopAdmin } from '../hooks/useWorkshopAdmin';
import { OverviewTab } from '../components/features/workshop/admin/tabs/OverviewTab';
import { AppointmentsTab } from '../components/features/workshop/admin/tabs/AppointmentsTab';
import { SettingsTab } from '../components/features/workshop/admin/tabs/SettingsTab';
import { TeamTab } from '../components/features/workshop/admin/tabs/TeamTab';

const SECCIONES = ['RESUMEN', 'CITAS', 'AJUSTES', 'EQUIPO', 'FINANZAS'];

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
  const {
    id,
    activeTab, setActiveTab,
    selectedDate, setSelectedDate,
    
    showCalendar, setShowCalendar,
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
    handleDeleteEmployee
  } = useWorkshopAdmin();

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
       <div className="w-16 h-16 border-t-2 border-red-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black relative selection:bg-red-500/30 selection:text-white pb-32">
      <DashboardHeader type="workshop" />

      <main className="flex-1 p-6 md:p-12 overflow-y-auto relative z-10 scrollbar-hide">
         <div className="max-w-6xl mx-auto space-y-12 animate-fade-in-up">
            
            <header className="flex justify-between items-end border-b border-neutral-800/60 pb-6 mb-8 relative z-50">
               <div>
                  <Link 
                    to="/owner-dashboard" 
                    className="flex items-center gap-2 text-neutral-500 hover:text-white mb-2 text-[10px] font-black uppercase tracking-widest transition-all group w-fit"
                  >
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Volver a Mis Talleres
                  </Link>
                  <h1 className="text-3xl md:text-4xl font-black uppercase tracking-[0.15em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                     {SECCIONES[activeTab]}
                  </h1>
               </div>

               <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsAppModalOpen(true)}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                    Nueva Cita
                  </button>
                  
                  {activeTab === 1 && (
                     <div className="flex items-center gap-2 bg-neutral-900/40 p-2 rounded-2xl border border-neutral-800">
                        <button onClick={() => {
                           const d = new Date(selectedDate);
                           d.setDate(d.getDate() - 1);
                           setSelectedDate(d);
                           
                        }} className="p-3 bg-black/40 hover:bg-red-500/20 text-neutral-400 hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-500/30">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        
                        <div className="relative">
                           <button onClick={() => setShowCalendar(!showCalendar)} className="flex flex-col items-center px-2 min-w-[100px] hover:bg-white/5 py-2 rounded-xl transition-colors">
                              <span className="text-white font-black uppercase tracking-widest text-sm text-center">
                                 {selectedDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '')}
                              </span>
                              <span className="text-[9px] font-mono text-neutral-500 uppercase mt-0.5 tracking-widest">Cambiar Fecha</span>
                           </button>
                           {/* Calendar Modal code could be extracted too, but for now kept here for simplicity */}
                        </div>

                        <button onClick={() => {
                           const d = new Date(selectedDate);
                           d.setDate(d.getDate() + 1);
                           setSelectedDate(d);
                           
                        }} className="p-3 bg-black/40 hover:bg-red-500/20 text-neutral-400 hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-500/30">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                     </div>
                  )}
               </div>
            </header>

            {activeTab === 0 && <OverviewTab workshopData={workshopData} diasSemana={diasSemana} />}
            {activeTab === 1 && <AppointmentsTab appointments={appointments} selectedDate={selectedDate} />}
            {activeTab === 2 && <SettingsTab settingsForm={settingsForm} setSettingsForm={setSettingsForm} onSubmit={handleSettingsSubmit} diasSemana={diasSemana} />}
            {activeTab === 3 && <TeamTab employeeForm={employeeForm} setEmployeeForm={setEmployeeForm} onSubmit={handleEmployeeSubmit} onDelete={handleDeleteEmployee} employees={employees} />}
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
    </div>
  );
}
