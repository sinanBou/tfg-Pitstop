import { useState } from 'react';
import { useOwnerDashboard } from '@/features/workshop/hooks/useOwnerDashboard';
import { DashboardHeader } from '@/components/layout/DashboardHeader/index';
import { BottomNav } from '@/components/layout/BottomNav/index';
import { LoadingScreen } from '@/components/common/LoadingScreen/index';
import { WorkshopManagementTab } from '@/features/workshop/components/owner/WorkshopManagementTab';
import { WorkshopReportsTab } from '@/features/workshop/components/owner/WorkshopReportsTab';
import { WorkshopCreationModal } from '@/features/workshop/components/modals/WorkshopCreationModal';

const SECCIONES = ['TALLERES', 'REPORTES'];

export default function OwnerDashboard() {
  const { loading, workshops, ownerId, fetchData } = useOwnerDashboard();
  const [activeTab, setActiveTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading) {
    return <LoadingScreen message="Sincronizando taller..." theme="workshop" />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black relative selection:bg-red-500/30 selection:text-white pb-32">
      
      {/* Fondo Glow Animado Global */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] -z-10 mix-blend-screen animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-neutral-600/10 rounded-full blur-[120px] -z-10 mix-blend-screen animate-[pulse_4s_infinite] pointer-events-none"></div>

      {/* Main Content Area */}
      <DashboardHeader type="workshop" />

      <main className="flex-1 overflow-y-auto relative z-10 scrollbar-hide pt-4">
        <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12 animate-fade-in-up">
            <header className="flex justify-between items-end border-b border-neutral-800/60 pb-6 mb-8">
               <div>
                  <h1 className="text-3xl md:text-4xl font-black uppercase tracking-[0.15em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                     {SECCIONES[activeTab]}
                  </h1>
               </div>
            </header>

            {activeTab === 0 && <WorkshopManagementTab workshops={workshops} onAddWorkshop={() => setIsModalOpen(true)} />}
            {activeTab === 1 && <WorkshopReportsTab workshops={workshops} />}
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