import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Language, Translations } from './types';
import { es } from './locales/es';
import { en } from './locales/en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const dictionaries: Record<Language, Translations> = { es, en };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('pitstop_language') as Language;
    if (saved === 'es' || saved === 'en') return saved;
    const browserLang = navigator.language.slice(0, 2);
    return browserLang === 'en' ? 'en' : 'es';
  });

  useEffect(() => {
    localStorage.setItem('pitstop_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (path: string, params?: Record<string, string | number>): string => {
    const keys = path.split('.');
    let current: any = dictionaries[language];
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback al español si falta una clave
        let fallback: any = dictionaries['es'];
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return path;
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current !== 'string') return path;

    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        current = (current as string).replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'), String(paramValue));
      });
    }

    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation debe ser usado dentro de un LanguageProvider');
  }
  return context;
};
