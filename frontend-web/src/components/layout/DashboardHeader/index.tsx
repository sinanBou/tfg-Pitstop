import React from 'react';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  type: 'client' | 'workshop';
  profilePictureUrl?: string;
  onOpenProfile?: () => void;
  onOpenWorkshopSettings?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  type, 
  profilePictureUrl, 
  onOpenProfile, 
  onOpenWorkshopSettings 
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isClient = type === 'client';
  const role = type === 'workshop' ? localStorage.getItem('role') : null;
  
  let subtitle = 'Soy Conductor';
  if (type === 'workshop') {
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

      <div className="flex items-center gap-3">
        {onOpenProfile && (
          <button 
             onClick={onOpenProfile}
             className="px-4 h-10 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)] bg-neutral-900/50 border border-neutral-800 active:scale-[0.98]"
             title="Mi Perfil"
          >
             {profilePictureUrl ? (
                <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-neutral-700">
                   <img src={profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
             ) : (
                <svg className="w-4 h-4 shrink-0 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
             )}
             <span className="hidden sm:inline">Mi Perfil</span>
          </button>
        )}

        {type === 'workshop' && (role === 'WORKSHOP_OWNER' || role === 'WORKSHOP_MANAGER') && onOpenWorkshopSettings && (
          <button 
             onClick={onOpenWorkshopSettings}
             className="px-4 h-10 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)] bg-neutral-900/50 border border-neutral-800 active:scale-[0.98]"
             title="Ajustes del Taller"
          >
             <svg className="w-4.5 h-4.5 shrink-0 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
             </svg>
             <span className="hidden sm:inline">Ajustes Taller</span>
          </button>
        )}

        <button 
           onClick={handleLogout}
           className="px-4 h-10 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)] bg-neutral-900/50 border border-neutral-800 active:scale-[0.98]"
           title="Cerrar Sesión"
        >
           <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
           </svg>
           <span className="hidden sm:inline">Cerrar Sesión</span>
           <span className="sm:hidden">Cerrar</span>
        </button>
      </div>
    </header>
  );
};
