import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { BottomNav } from '../components/dashboard/BottomNav';
import { LoadingScreen } from '../components/dashboard/LoadingScreen';
import { API_BASE_URL } from '../config/api';
import { StaffAppointmentModal } from '../components/dashboard/workshop/appointments/StaffAppointmentModal';


const SECCIONES = ['RESUMEN', 'CITAS'];

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [employeeProfile, setEmployeeProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);


  useEffect(() => {
    fetchWorkerData();
  }, [navigate]);

  const fetchWorkerData = async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/employees/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("No autenticado");
      const data = await res.json();
      setEmployeeProfile(data);

      if (data.workshopId) {
        // Fetch appointments for this workshop
        const appRes = await fetch(`${API_BASE_URL}/appointments/workshop/${data.workshopId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(appRes.ok) {
          const appData = await appRes.json();
          setAppointments(appData);
        }
      }
    } catch (err) {
      console.error(err);
      localStorage.clear();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Sincronizando panel..." theme="workshop" />;
  }

  const fetchMakes = async () => {
    const token = localStorage.getItem('jwt_token');
    const res = await fetch(`${API_BASE_URL}/vehicles/catalog/makes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  };

  const fetchModels = async (make: string) => {
    const token = localStorage.getItem('jwt_token');
    const res = await fetch(`${API_BASE_URL}/vehicles/catalog/models/${make}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  };

  // Comprobar si es manager o staff

  const isManager = employeeProfile?.role === 'WORKSHOP_MANAGER';

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black relative selection:bg-red-500/30 selection:text-white pb-24">
      
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
                  {/* BOTÓN NUEVA CITA PRESENCIAL */}
                  <button 
                    onClick={() => setIsAppModalOpen(true)}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                    Nueva Cita
                  </button>

                  {/* BOTÓN PARA EL ENCARGADO */}
                  {isManager && employeeProfile?.workshopId && (
                    <button 
                      onClick={() => navigate(`/workshop/${employeeProfile.workshopId}`)}
                      className="px-6 py-3 bg-red-600/20 hover:bg-red-600/40 text-red-500 hover:text-red-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-red-500/30 hover:border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.1)] flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Gestión del Taller
                    </button>
                  )}
                </div>
            </header>

            {activeTab === 0 && (
               <div className="space-y-6">
                  <div className="bg-neutral-900/40 border border-neutral-800 p-8 rounded-[2rem]">
                     <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-2">
                        Hola, {employeeProfile?.firstname}
                     </h2>
                     <p className="text-neutral-400 font-mono mb-8">
                        Taller activo: {employeeProfile?.workshopName || 'No asignado'}
                     </p>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                           <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-2">Rol Actual</p>
                           <p className="text-xl font-black text-white">{isManager ? 'ENCARGADO (Mánager)' : 'MECÁNICO (Staff)'}</p>
                        </div>
                        <div className="bg-black/40 p-6 rounded-2xl border border-red-500/10">
                           <p className="text-[10px] uppercase font-bold tracking-widest text-red-500 mb-2">Citas del Taller</p>
                           <p className="text-3xl font-black text-white">{appointments.length}</p>
                        </div>
                     </div>
                  </div>
               </div>
            )}
            
            {activeTab === 1 && (
               <div className="space-y-6">
                  {appointments.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                        {appointments.map((app, index) => (
                           <div key={app.id} className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-[2rem] hover:border-red-500/40 transition-colors shadow-lg relative group overflow-hidden flex flex-col">
                              {/* Background Glow */}
                              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                                 <svg className="w-24 h-24 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              </div>
                              <div className="relative z-10">
                                 <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center border border-red-500/30 font-black shrink-0">
                                       {String(index + 1).padStart(2, '0')}
                                    </div>
                                    <div>
                                       <h4 className="text-sm font-black text-white uppercase tracking-wider">{app.serviceType}</h4>
                                       <p className="text-xs text-red-400 font-mono font-bold">
                                          {new Date(app.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {new Date(app.dateTime).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '-')}
                                       </p>
                                    </div>
                                 </div>
                                 
                                 <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3 mb-4 flex-1">
                                    <div className="flex items-start gap-2 text-neutral-400">
                                       <svg className="w-4 h-4 shrink-0 mt-0.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                       <p className="text-xs font-medium truncate">{app.clientFullName}</p>
                                    </div>
                                    <div className="flex items-start gap-2 text-neutral-400">
                                       <svg className="w-4 h-4 shrink-0 mt-0.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                       <p className="text-xs font-mono font-bold truncate">{app.vehicleDisplay}</p>
                                    </div>
                                 </div>
                                 <div className="text-xs text-neutral-500 line-clamp-2 h-8">"{app.description}"</div>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="border border-dashed border-neutral-800 bg-neutral-900/20 rounded-[2rem] p-12 text-center opacity-50 animate-in fade-in">
                        <svg className="w-12 h-12 text-neutral-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="text-neutral-500 font-mono text-sm uppercase tracking-widest">No hay citas programadas para el taller</p>
                     </div>
                  )}
               </div>
            )}
         </div>
      </main>

      {/* --- FLOATING BOTTOM NAV --- */}
      <BottomNav tabs={SECCIONES} activeTab={activeTab} onTabChange={setActiveTab} theme="workshop" />

      {/* ESTILOS INLINE PARA CUSTOM SCROLLBAR Y ANIMATIONS */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
        
        @keyframes fade-in-up {
           0% { opacity: 0; transform: translateY(20px); }
           100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
           animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
           opacity: 0;
        }
      `}</style>

      {employeeProfile?.workshopId && (
        <StaffAppointmentModal 
          isOpen={isAppModalOpen}
          onClose={() => setIsAppModalOpen(false)}
          workshopId={employeeProfile.workshopId}
          onSuccess={() => { fetchWorkerData(); setIsAppModalOpen(false); }}
          fetchMakes={fetchMakes}
          fetchModels={fetchModels}
        />
      )}
    </div>

  );
}
