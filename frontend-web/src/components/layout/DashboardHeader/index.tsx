import React from 'react';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  type: 'client' | 'workshop';
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ type }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    // Use window.location.href or navigate, both work. Since navigate might be missing Provider context if misused, but both dashboards use navigate.
    navigate('/login');
  };

  const isClient = type === 'client';
  
  let subtitle = 'Soy Conductor';
  if (type === 'workshop') {
    const role = localStorage.getItem('role');
    if (role === 'WORKSHOP_STAFF') subtitle = 'Soy Mecánico';
    else if (role === 'WORKSHOP_MANAGER') subtitle = 'Soy Encargado';
    else subtitle = 'Soy Propietario';
  }
  const subtitleColorClass = isClient 
    ? 'text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]' 
    : 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]';

  return (
    <header className="px-6 py-4 md:px-12 md:py-6 flex justify-between items-center z-50 relative bg-gradient-to-b from-black/20 to-transparent backdrop-blur-[2px]">
      <div className="flex flex-col">
         <h2 className="text-[2rem] md:text-[2.5rem] font-black italic tracking-tighter uppercase text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">PitStop</h2>
         <p className={`text-[10px] font-black uppercase tracking-[0.3em] mt-1 ${subtitleColorClass}`}>
            {subtitle}
         </p>
      </div>
      <button 
         onClick={handleLogout}
         className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)] bg-neutral-900/50 border border-neutral-800"
         title="Cerrar Sesión"
      >
         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
         </svg>
      </button>
    </header>
  );
};
