import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ThemeMode, ResolvedTheme, ThemeContextType } from '@/types/theme';
import {
  getStoredTheme,
  persistTheme,
  getSystemTheme,
  resolveThemeStrategy,
  applyThemeToDom,
} from '@/utils/theme';

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Hook auxiliar modular para escuchar dinámicamente cambios en la preferencia del SO (Observer).
 */
const useSystemThemeObserver = (): ResolvedTheme => {
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return systemTheme;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
}

/**
 * Proveedor de tema global con persistencia y sincronización reactiva.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'system' 
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => getStoredTheme(defaultTheme));
  const systemTheme = useSystemThemeObserver();

  const resolvedTheme = useMemo(
    () => resolveThemeStrategy(theme, systemTheme),
    [theme, systemTheme]
  );

  useEffect(() => {
    applyThemeToDom(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    persistTheme(newTheme);
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Hook interno para consumir el contexto de tema con validación de aislamiento.
 */
export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser utilizado dentro de un ThemeProvider');
  }
  return context;
};
