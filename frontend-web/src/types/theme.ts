/**
 * Tipos de configuración para el sistema de temas de la aplicación.
 */

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextType {
  /** Modo seleccionado por el usuario ('light', 'dark', 'system') */
  theme: ThemeMode;
  /** Tema efectivo aplicado en el DOM ('light' o 'dark') */
  resolvedTheme: ResolvedTheme;
  /** Función para actualizar el tema */
  setTheme: (theme: ThemeMode) => void;
}
