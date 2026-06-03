import { createPortal } from 'react-dom';
import type { BaseModalProps } from './BaseModal.types';
import { X } from '@/assets/icons';

export const BaseModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  theme = 'blue',
  progressBarWidth,
  showDot = true,
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay con desenfoque */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose} 
        data-testid="modal-overlay"
      />
      
      {/* Landscape Modal Container: Wider than tall (max-w-5xl, h-[85vh] max-h-[650px]) */}
      <div className="relative bg-neutral-900/95 backdrop-blur-2xl border border-neutral-800 rounded-2xl w-full max-w-5xl h-[85vh] max-h-[650px] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-300">
        
        {/* Glow decorativo */}
        <div className={`absolute top-0 right-0 w-64 h-64 ${glowColor} rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none`}></div>
        
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
              {showDot && (
                <span className="flex h-2 w-2 relative">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingColor} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}></span>
                </span>
              )}
            </h2>
            {subtitle && (
              <p className="text-[10px] text-neutral-500 font-mono mt-1 uppercase">{subtitle}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors" data-testid="modal-close-btn">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 pb-12 relative flex-1 overflow-y-auto custom-scrollbar">
          <div className="relative z-10 h-full flex flex-col">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
