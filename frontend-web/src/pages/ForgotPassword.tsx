import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputGroup from '@/components/common/InputGroup/InputGroup';
import { Button } from '@/components/common/Button/Button';
import { forgotPassword } from '@/features/auth/services/authService';
import { useToast } from '@/hooks/useToast';
import { ArrowLeft } from '@/assets/icons';
import { useTranslation } from '@/i18n';
import { LanguageSelector } from '@/components/common/LanguageSelector/LanguageSelector';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, introduce tu correo electrónico.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await forgotPassword(email);
      toast.success('Enlace de recuperación enviado con éxito. Revisa tu correo electrónico.');
      navigate('/login');
    } catch (err: any) {
      const msg = err.message || 'Error al procesar la solicitud.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-6 relative bg-zinc-950 font-sans selection:bg-blue-500/30 selection:text-white overflow-hidden">
      
      {/* Selector de idioma flotante superior derecha */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageSelector />
      </div>

      {/* Fondo Glow estático */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none z-0"></div>

      <div className="w-full max-w-lg z-10 animate-fade-in-up">
        
        {/* Card Contenedor */}
        <div className="bg-neutral-950/60 backdrop-blur-xl p-10 sm:p-12 rounded-[2.5rem] border border-neutral-800/60 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">

          <div className="mb-10 text-center">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">{t('auth.resetPasswordTitle')}</h2>
            <p className="text-neutral-500 text-sm font-medium tracking-wide">{t('auth.resetPasswordSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <InputGroup 
              label={t('auth.emailLabel')} 
              name="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              error={error} 
              placeholder="tu@email.com" 
            />

            <Button 
              type="submit"
              disabled={isLoading}
              variant="primary"
              className="mt-6 w-full py-4 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]"
            >
              {isLoading ? t('common.loading') : t('auth.sendResetLink')}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-neutral-500 text-sm">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link to="/login" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
                {t('auth.loginHere')}
              </Link>
            </p>
          </div>
        </div>
        
        {/* Volver al inicio */}
        <div className="mt-8 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-neutral-600 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
               <ArrowLeft className="w-4 h-4" />
               {t('common.back')} {t('common.login')}
            </Link>
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export default ForgotPassword;
