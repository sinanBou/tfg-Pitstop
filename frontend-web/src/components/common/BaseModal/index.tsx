import React from 'react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  theme?: 'blue' | 'red' | 'neutral' | 'green';
  progressBarWidth?: string; // e.g., "50%" or "100%"
  children: React.ReactNode;
}

export const BaseModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  theme = 'blue',
  progressBarWidth,
  children
}: BaseModalProps) => {
  if (!isOpen) return null;

  // Curated theme classes
  const glowColor = 
    theme === 'red' ? 'bg-red-600/5' : 
    theme === 'green' ? 'bg-green-600/5' : 
    'bg-blue-600/5';
  const dotColor = 
    theme === 'red' ? 'bg-red-500' : 
    theme === 'green' ? 'bg-green-500' : 
    'bg-blue-500';
  const pingColor = 
    theme === 'red' ? 'bg-red-400' : 
    theme === 'green' ? 'bg-green-400' : 
    'bg-blue-400';
  const barColor = 
    theme === 'red' ? 'bg-red-600' : 
    theme === 'green' ? 'bg-green-600' : 
    'bg-blue-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay con desenfoque */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose} 
      />
      
      {/* Landscape Modal Container: Wider than tall (max-w-5xl, h-[85vh] max-h-[650px]) */}
      <div className="relative bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-3xl w-full max-w-5xl h-[85vh] max-h-[650px] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-300">
        
        {/* Barra de progreso visual con brillo (Opcional) */}
        {progressBarWidth && (
          <div className="flex h-1.5 w-full bg-neutral-900 relative z-20">
            <div 
              className={`${barColor} transition-all duration-700 ease-out relative`} 
              style={{ width: progressBarWidth }}
            >
              <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-r from-transparent to-white/40 blur-[2px]"></div>
            </div>
          </div>
        )}

        {/* Cabecera del Modal */}
        <div className="relative p-6 px-8 border-b border-neutral-800/50 bg-neutral-950/50 flex justify-between items-center z-10 shrink-0">
          <div>
            <h2 className="text-white text-2xl font-black uppercase tracking-widest flex items-center gap-3">
              {title}
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingColor} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}></span>
              </span>
            </h2>
            {subtitle && (
              <p className="text-[10px] text-neutral-500 font-mono mt-1 uppercase">{subtitle}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido principal con scroll auto */}
        <div className="p-8 pb-12 relative flex-1 overflow-y-auto custom-scrollbar">
          {/* Fondo decorativo interno */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className={`absolute -top-[40%] -left-[40%] w-full h-full ${glowColor} blur-[100px] rounded-full mix-blend-screen`}></div>
          </div>
          
          <div className="relative z-10 h-full flex flex-col">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
