import type { LoadingScreenProps } from './LoadingScreen.types';

export function LoadingScreen({ message, theme }: LoadingScreenProps) {
  const isClient = theme === 'client';
  const borderClass = isClient ? 'border-blue-600' : 'border-red-600';
  
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-black flex flex-col items-center justify-center">
      <div className={`w-12 h-12 border-4 ${borderClass} border-t-transparent rounded-full animate-spin mb-4`}></div>
      <p className="text-slate-900 dark:text-white font-black italic tracking-widest animate-pulse uppercase text-xs">
        {message}
      </p>
    </div>
  );
}
