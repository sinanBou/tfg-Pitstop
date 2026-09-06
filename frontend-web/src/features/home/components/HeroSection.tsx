import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button/Button';
import { Building, User, FileText } from '@/assets/icons';
import { useTranslation } from '@/i18n';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="relative z-10 w-full min-h-screen flex flex-col justify-center items-center text-center px-4 pt-32 pb-20">
      
      <h1 className="text-white text-5xl md:text-[6rem] font-black mb-8 max-w-5xl leading-[0.9] tracking-tighter uppercase animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        {t('home.heroTitle')}
      </h1>
      
      <p className="text-neutral-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {t('home.heroSubtitle')}
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <Button 
          onClick={() => navigate('/registration')} 
          variant="primary"
          className="shadow-[0_0_40px_rgba(255,255,255,0.2)] !bg-white !text-black hover:!bg-neutral-200 border-transparent transition-all duration-300 scale-105 active:scale-95 px-10 py-4"
          glow={false}
        >
          <span className="relative z-10 flex items-center gap-3">
            {t('common.register')}
          </span>
        </Button>
        <Button 
          onClick={() => navigate('/login')} 
          variant="ghost"
          className="!bg-neutral-900/80 hover:!bg-neutral-800 !text-white hover:!text-white !border !border-neutral-700 hover:!border-neutral-500 transition-all duration-300 scale-105 active:scale-95 px-10 py-4 shadow-lg shadow-black/40 backdrop-blur-sm"
        >
          <span className="relative z-10 flex items-center gap-3">
            {t('common.login')}
          </span>
        </Button>
      </div>

      <div className="mt-24 w-full max-w-5xl relative animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-900/40 border border-neutral-800/80 p-8 rounded-[2rem] text-left relative overflow-hidden group hover:border-red-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center mb-6">
              <Building className="w-6 h-6 text-red-500" strokeWidth={2} />
            </div>
            <h4 className="text-white text-lg font-black uppercase tracking-wider mb-2">{t('home.workshopCardTitle')}</h4>
            <p className="text-neutral-400 text-sm leading-relaxed font-medium">{t('home.workshopCardDesc')}</p>
          </div>

          <div className="bg-neutral-900/40 border border-neutral-800/80 p-8 rounded-[2rem] text-left relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-6">
              <User className="w-6 h-6 text-blue-500" strokeWidth={2} />
            </div>
            <h4 className="text-white text-lg font-black uppercase tracking-wider mb-2">{t('home.driverCardTitle')}</h4>
            <p className="text-neutral-400 text-sm leading-relaxed font-medium">{t('home.driverCardDesc')}</p>
          </div>

          <div className="bg-neutral-900/40 border border-neutral-800/80 p-8 rounded-[2rem] text-left relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-yellow-600/10 border border-yellow-500/20 flex items-center justify-center mb-6">
              <FileText className="w-6 h-6 text-yellow-500" strokeWidth={2} />
            </div>
            <h4 className="text-white text-lg font-black uppercase tracking-wider mb-2">{t('home.feature3Title')}</h4>
            <p className="text-neutral-400 text-sm leading-relaxed font-medium">{t('home.feature3Desc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
