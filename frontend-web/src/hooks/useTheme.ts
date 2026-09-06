import { useThemeContext } from '@/context/ThemeContext';
import type { ThemeContextType } from '@/types/theme';

/**
 * Hook público para consumir el estado y acciones del sistema de temas.
 */
export const useTheme = (): ThemeContextType => {
  return useThemeContext();
};

export default useTheme;
