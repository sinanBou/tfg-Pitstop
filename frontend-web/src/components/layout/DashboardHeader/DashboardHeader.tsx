import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { DashboardHeaderProps } from './DashboardHeader.types';
import { User, Settings, LogOut } from '@/assets/icons';
import { useTranslation } from '@/i18n';
import { LanguageSelector } from '@/components/common/LanguageSelector/LanguageSelector';
import { ThemeSelector } from '@/components/common/ThemeSelector';

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  type, 
  profilePictureUrl, 
  onOpenProfile, 
  onOpenWorkshopSettings 
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  const isClient = type === 'client';
  const role = type === 'workshop' ? localStorage.getItem('role') : null;
  
  let subtitle = t('roles.client');
  if (type === 'workshop') {
    if (role === 'WORKSHOP_STAFF') subtitle = t('roles.staff');
    else if (role === 'WORKSHOP_MANAGER') subtitle = t('roles.manager');
    else subtitle = t('roles.owner');
  }
  const subtitleColorClass = isClient 
    ? 'text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]' 
    : 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]';

  return (
    <header className="px-6 py-4 md:px-12 md:py-6 flex justify-between items-center z-50 relative bg-gradient-to-b from-slate-200/40 dark:from-black/20 to-transparent backdrop-blur-[2px] transition-colors">
      <div className="flex flex-col">
         <h2 className="text-[2rem] md:text-[2.5rem] font-black italic tracking-tighter uppercase text-slate-900 dark:text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">PitStop</h2>
         <p className={`text-[10px] font-black uppercase tracking-[0.3em] mt-1 ${subtitleColorClass}`}>
            {subtitle}
         </p>
      </div>

      <div className="flex items-center gap-3">
        <ThemeSelector />
        <LanguageSelector />

        {onOpenProfile && (
          <button 
             onClick={onOpenProfile}
             className="px-4 h-10 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-neutral-800 rounded-xl transition-all shadow-sm dark:shadow-[0_0_10px_rgba(0,0,0,0.5)] bg-white/70 dark:bg-neutral-900/50 border border-slate-300/80 dark:border-neutral-800 active:scale-[0.98] cursor-pointer"
             title={t('common.myProfile')}
          >
             {profilePictureUrl ? (
                <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-slate-300 dark:border-neutral-700">
                   <img src={profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
             ) : (
                 <User className="w-4 h-4 shrink-0 text-slate-500 dark:text-neutral-400" />
             )}
             <span className="hidden sm:inline">{t('common.myProfile')}</span>
          </button>
        )}

        {type === 'workshop' && (role === 'WORKSHOP_OWNER' || role === 'WORKSHOP_MANAGER') && onOpenWorkshopSettings && (
          <button 
             onClick={onOpenWorkshopSettings}
             className="px-4 h-10 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-neutral-800 rounded-xl transition-all shadow-sm dark:shadow-[0_0_10px_rgba(0,0,0,0.5)] bg-white/70 dark:bg-neutral-900/50 border border-slate-300/80 dark:border-neutral-800 active:scale-[0.98] cursor-pointer"
             title={t('common.workshopSettings')}
          >
             <Settings className="w-4.5 h-4.5 shrink-0 text-slate-500 dark:text-neutral-400" />
             <span className="hidden sm:inline">{t('common.workshopSettings')}</span>
          </button>
        )}

        <button 
           onClick={handleLogout}
           className="px-4 h-10 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all shadow-sm dark:shadow-[0_0_10px_rgba(0,0,0,0.5)] bg-white/70 dark:bg-neutral-900/50 border border-slate-300/80 dark:border-neutral-800 active:scale-[0.98] cursor-pointer"
           title={t('common.logout')}
        >
           <LogOut className="w-4 h-4 shrink-0" />
           <span className="hidden sm:inline">{t('common.logout')}</span>
           <span className="sm:hidden">{t('common.logout')}</span>
        </button>
      </div>
    </header>
  );
};
