import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { BottomNav } from '../components/dashboard/BottomNav';
import { LoadingScreen } from '../components/dashboard/LoadingScreen';
import { WorkshopManagementTab } from '../components/dashboard/workshop/tabs/WorkshopManagementTab';
import { WorkshopReportsTab } from '../components/dashboard/workshop/tabs/WorkshopReportsTab';
import { WorkshopCreationModal } from '../components/dashboard/workshop/WorkshopCreationModal';

const API_URL = 'http://localhost:9091/api';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("No autenticado");
      const data = await res.json();
      
      setOwnerId(data.employeeId);
      
      const wRes = await fetch(`${API_URL}/workshops/owner/${data.employeeId}`, {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      if (wRes.ok) {
        const wData = await wRes.json();
        setWorkshops(wData);
      }
    } catch (err) {
      console.error(err);
      localStorage.clear();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };



  const [activeTab, setActiveTab] = useState(0);
  const SECCIONES = ['TALLERES', 'REPORTES'];

  if (loading) {
    return <LoadingScreen message="Sincronizando taller..." theme="workshop" />;
  }

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
            </header>

            {activeTab === 0 && <WorkshopManagementTab workshops={workshops} onAddWorkshop={() => setIsModalOpen(true)} />}
            {activeTab === 1 && <WorkshopReportsTab />}
         </div>
      </main>

      {/* --- FLOATING BOTTOM NAV --- */}
      <BottomNav tabs={SECCIONES} activeTab={activeTab} onTabChange={setActiveTab} theme="workshop" />

      {/* MODAL DE CREACIÓN */}
      <WorkshopCreationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        ownerId={ownerId}
      />

      {/* ESTILOS INLINE PARA CUSTOM SCROLLBAR Y ANIMATIONS */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f1f1f; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
        
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