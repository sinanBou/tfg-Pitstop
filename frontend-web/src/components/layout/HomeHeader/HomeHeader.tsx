import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { LanguageSelector } from '@/components/common/LanguageSelector/LanguageSelector';
import { ThemeSelector } from '@/components/common/ThemeSelector';

export function HomeHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const homeBar = location.pathname === '/';
  const authBar = location.pathname === '/login' || location.pathname === '/registration';

  const handleLogout = () => {
    localStorage.clear(); 
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <nav className="bg-white/80 dark:bg-zinc-950 backdrop-blur-md h-16 w-full px-5 py-3 flex items-center justify-between text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 z-50 relative transition-colors">
      <div className="text-xl p-1">
        <Link to="/" className="font-bold text-3xl sm:text-4xl italic tracking-tighter text-slate-900 dark:text-white">
          PitStop
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <ThemeSelector />
        <LanguageSelector />

        {homeBar && (
          <div className="flex gap-2 sm:gap-4 text-sm font-bold">
            <Link 
              to="/login" 
              className="border border-white/30 rounded-xl px-3 py-2 hover:bg-white/10 transition-colors flex items-center"
            >
              {t('common.login')}
            </Link>
            <Link 
              to="/registration" 
              className="bg-red-600 text-white rounded-xl px-3 py-2 hover:bg-red-700 transition-colors flex items-center shadow-lg shadow-red-900/30"
            >
              {t('common.register')}
            </Link>
          </div>
        )}
        {!homeBar && !authBar && (
          <div className="flex gap-4 text-sm font-bold">
            <button 
              onClick={handleLogout}
              className="bg-red-600 text-white rounded-xl px-4 py-2 hover:bg-red-700 transition-colors"
            >
              {t('common.logout')}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
