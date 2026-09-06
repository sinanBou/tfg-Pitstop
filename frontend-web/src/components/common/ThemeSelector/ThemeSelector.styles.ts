/**
 * Estilos atómicos y clases Tailwind para el componente ThemeSelector.
 */

export const containerStyles = 
  'inline-flex items-center p-1 rounded-xl bg-slate-200/60 dark:bg-neutral-900/60 ' +
  'border border-slate-300/80 dark:border-neutral-800 backdrop-blur-md transition-colors';

export const buttonBaseStyles = 
  'relative flex items-center justify-center p-2 rounded-lg text-xs font-semibold ' +
  'transition-all duration-200 focus:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-red-500 active:scale-95';

export const buttonActiveStyles = 
  'bg-white dark:bg-neutral-800 text-red-600 dark:text-red-400 ' +
  'shadow-sm dark:shadow-[0_0_12px_rgba(239,68,68,0.2)]';

export const buttonInactiveStyles = 
  'text-slate-600 dark:text-neutral-400 hover:text-slate-900 ' +
  'dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5';
