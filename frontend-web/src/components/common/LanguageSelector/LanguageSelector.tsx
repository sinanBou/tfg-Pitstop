import React from 'react';
import { useTranslation } from '@/i18n';

/**
 * Componente selector de idioma elegante para cambiar de forma reactiva entre Español (ES) e Inglés (EN).
 */
export const LanguageSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      className={`px-3 h-10 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-neutral-800 rounded-xl transition-all shadow-sm dark:shadow-[0_0_10px_rgba(0,0,0,0.5)] bg-slate-100/80 dark:bg-neutral-900/60 border border-slate-300/80 dark:border-neutral-800 active:scale-[0.98] cursor-pointer ${className}`}
      title={language === 'es' ? 'Cambiar a Inglés' : 'Switch to Spanish'}
      aria-label="Cambiar Idioma"
    >
      <span className="text-base leading-none" role="img" aria-label={language === 'es' ? 'España' : 'UK'}>
        {language === 'es' ? '🇪🇸' : '🇬🇧'}
      </span>
      <span className="font-extrabold">{language.toUpperCase()}</span>
    </button>
  );
};
