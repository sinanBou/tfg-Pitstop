import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from '@/assets/icons';

export interface ConfirmCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  theme?: 'red' | 'blue' | 'green' | 'amber';
  isLoading?: boolean;
}

export const ConfirmCardModal: React.FC<ConfirmCardModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Sí, Confirmar',
  cancelText = 'Cancelar',
  theme = 'red',
  isLoading = false
}) => {
  if (!isOpen) return null;

  // Clases dinámicas según el tema seleccionado
  const glowColor =
    theme === 'red' ? 'bg-red-600/5' :
    theme === 'green' ? 'bg-green-600/5' :
    theme === 'amber' ? 'bg-amber-600/5' :
    'bg-blue-600/5';

  const iconBg =
    theme === 'red' ? 'bg-red-500/20 text-red-500' :
    theme === 'green' ? 'bg-green-500/20 text-green-500' :
    theme === 'amber' ? 'bg-amber-500/20 text-amber-500' :
    'bg-blue-500/20 text-blue-500';

  const confirmBtnBg =
    theme === 'red' ? 'bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]' :
    theme === 'green' ? 'bg-green-600 hover:bg-green-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' :
    theme === 'amber' ? 'bg-amber-600 hover:bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]' :
    'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]';

  const titleAlertText =
    theme === 'red' ? 'text-red-400' :
    theme === 'green' ? 'text-green-400' :
    theme === 'amber' ? 'text-amber-400' :
    'text-blue-400';

  const alertBorder =
    theme === 'red' ? 'bg-red-500/10 border-red-500/20' :
    theme === 'green' ? 'bg-green-500/10 border-green-500/20' :
    theme === 'amber' ? 'bg-amber-500/10 border-amber-500/20' :
    'bg-blue-500/10 border-blue-500/20';

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay de fondo difuminado */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose} 
      />

      {/* Contenedor tipo Card Compacto */}
      <div className="relative bg-neutral-900/95 backdrop-blur-2xl border border-neutral-800 rounded-3xl w-full max-w-md flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-300 p-6 md:p-8 z-10">
        
        {/* Glow decorativo de fondo */}
        <div className={`absolute top-0 right-0 w-48 h-48 ${glowColor} rounded-full blur-[80px] -mr-24 -mt-24 pointer-events-none`}></div>

        <div className="space-y-6 relative z-10">
          {/* Alerta Destacada */}
          <div className={`p-5 rounded-2xl border ${alertBorder} text-center flex flex-col items-center gap-4`}>
            <div className={`w-14 h-14 rounded-full ${iconBg} flex items-center justify-center`}>
              <AlertTriangle className="w-7 h-7 animate-pulse" />
            </div>
            
            <h3 className="text-xl font-black uppercase tracking-wider text-white leading-tight">
              {title}
            </h3>
            
            <p className={`text-sm font-bold ${titleAlertText} leading-relaxed`}>
              {description}
            </p>
          </div>

          <div className="flex gap-3 justify-end border-t border-neutral-800/50 pt-6">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-6 py-3.5 rounded-xl border border-neutral-800 hover:border-neutral-700 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className={`px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50 ${confirmBtnBg}`}
            >
              {isLoading ? 'Confirmando...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
