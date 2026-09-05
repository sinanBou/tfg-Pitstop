import { Link } from 'react-router-dom';
import { Building, Car } from '@/assets/icons';
import { useTranslation } from '@/i18n';

interface RoleSelectorProps {
  onSelectRole: (role: 'workshop' | 'client') => void;
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="animate-fade-in text-center flex flex-col items-center">
      <h2 className="text-4xl md:text-5xl font-black mb-4 text-white uppercase tracking-tighter">{t('auth.selectRoleTitle')}</h2>
      <p className="text-neutral-500 mb-12 text-sm font-medium tracking-wide">{t('auth.registerSubtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        <button 
          onClick={() => onSelectRole('workshop')} 
          className="group relative bg-neutral-950/60 backdrop-blur-xl border border-neutral-800 p-12 rounded-[2.5rem] transition-all hover:bg-neutral-900/80 hover:-translate-y-2 overflow-hidden"
        >
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 group-hover:scale-110 group-hover:bg-red-500/20 transition-all text-red-500">
              <Building className="w-10 h-10" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-widest text-white group-hover:text-red-400 transition-colors">{t('auth.roleWorkshop')}</h3>
            <p className="text-neutral-500 mt-3 text-sm font-medium">{t('home.workshopCardDesc')}</p>
          </div>
        </button>

        <button 
          onClick={() => onSelectRole('client')} 
          className="group relative bg-neutral-950/60 backdrop-blur-xl border border-neutral-800 p-12 rounded-[2.5rem] transition-all hover:bg-neutral-900/80 hover:-translate-y-2 overflow-hidden"
        >
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all text-blue-400">
              <Car className="w-10 h-10" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-widest text-white group-hover:text-blue-400 transition-colors">{t('auth.roleClient')}</h3>
            <p className="text-neutral-500 mt-3 text-sm font-medium">{t('home.driverCardDesc')}</p>
          </div>
        </button>
      </div>

      <div className="mt-16">
         <Link to="/login" className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
            {t('auth.alreadyHaveAccount')} <span className="text-white border-b border-white/30 hover:border-white">{t('auth.loginHere')}</span>
         </Link>
      </div>
    </div>
  );
}
