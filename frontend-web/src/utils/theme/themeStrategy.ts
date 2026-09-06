import type { ThemeMode, ResolvedTheme } from '@/types/theme';

export const THEME_STORAGE_KEY = 'pitstop_theme';
const VALID_THEMES: readonly ThemeMode[] = ['light', 'dark', 'system'];

/**
 * Valida y sanitiza si un valor recibido es un ThemeMode legítimo (Security-first).
 */
export const isValidTheme = (value: unknown): value is ThemeMode => {
  return typeof value === 'string' && VALID_THEMES.includes(value as ThemeMode);
};

/**
 * Recupera el tema guardado en localStorage de forma segura con fallback.
 */
export const getStoredTheme = (defaultTheme: ThemeMode = 'system'): ThemeMode => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return defaultTheme;
    const item = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isValidTheme(item) ? item : defaultTheme;
  } catch {
    return defaultTheme;
  }
};

/**
 * Guarda la preferencia de tema en localStorage con control de excepciones.
 */
export const persistTheme = (theme: ThemeMode): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  } catch {
    // Manejo de cuota excedida o almacenamiento deshabilitado (modo incógnito estricto)
  }
};

/**
 * Detecta la preferencia de color del sistema operativo mediante matchMedia.
 */
export const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Patrón Strategy: Resuelve el tema activo a aplicar ('light' | 'dark') según el modo.
 */
export const resolveThemeStrategy = (
  mode: ThemeMode,
  systemTheme: ResolvedTheme
): ResolvedTheme => {
  if (mode === 'system') return systemTheme;
  return mode;
};

/**
 * Aplica los cambios de tema sobre el elemento raíz (document.documentElement).
 */
export const applyThemeToDom = (resolved: ResolvedTheme): void => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  root.style.colorScheme = resolved;
};
