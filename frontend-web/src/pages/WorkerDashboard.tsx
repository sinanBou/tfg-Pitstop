import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '../components/layout/DashboardHeader/index';
import { BottomNav } from '../components/layout/BottomNav/index';
import { LoadingScreen } from '../components/common/LoadingScreen/index';
import { StaffAppointmentModal } from '../components/features/workshop/StaffAppointmentModal/index';
import { useWorkerDashboard } from '../hooks/useWorkerDashboard';

const SECCIONES = ['RESUMEN', 'CITAS'];

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const { loading, employeeProfile, appointments, fetchWorkerData } = useWorkerDashboard();
  const [activeTab, setActiveTab] = useState(0);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);

  if (loading) {
    return <LoadingScreen message="Sincronizando panel..." theme="workshop" />;
  }

  const isManager = employeeProfile?.role === 'WORKSHOP_MANAGER';

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black relative selection:bg-red-500/30 selection:text-white pb-32">
      
      {/* Fondo Glow Animado Global */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] -z-10 mix-blend-screen animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-neutral-600/10 rounded-full blur-[120px] -z-10 mix-blend-screen animate-[pulse_4s_infinite] pointer-events-none"></div>

      {/* Top Header */}
      <DashboardHeader type="workshop" />

      {/* --- CONTENT AREA --- */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto relative z-10 scrollbar-hide">
         
         <div className="max-w-6xl mx-auto space-y-12 animate-fade-in-up">
            
            <header className="flex justify-between items-end border-b border-neutral-800/60 pb-6 mb-8">
               <div>
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

                  {isManager && (
                    <button 
                        onClick={() => navigate(`/workshop/${employeeProfile.workshopId}`)} 
                        className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Gestionar Taller
                    </button>
                  )}
               </div>
            </header>

            {activeTab === 0 && (
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
                         {appointments.length > 0 ? appointments.map(app => (
                            <div key={app.id} className="p-4 bg-black/40 border border-neutral-800 rounded-2xl hover:border-neutral-700 transition-colors">
                               <p className="text-white font-black text-xs uppercase mb-1">{app.serviceType}</p>
                               <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
                                  <span>{new Date(app.dateTime).toLocaleDateString()}</span>
                                  <span className="text-red-500">{new Date(app.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}h</span>
                                </div>
                            </div>
                         )) : <p className="text-neutral-500 text-xs italic">No hay citas pendientes.</p>}
                      </div>
                   </div>
                </div>
            )}
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
