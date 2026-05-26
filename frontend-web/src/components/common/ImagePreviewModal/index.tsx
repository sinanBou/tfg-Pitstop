import React from 'react';
import { createPortal } from 'react-dom';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title = 'Vista previa de imagen'
}) => {
  if (!isOpen || !imageUrl) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay backdrop */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-md transition-opacity duration-300 cursor-zoom-out animate-fade-in" 
        onClick={onClose} 
      />
      
      {/* Close button at the top-right corner of the viewport */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 p-3 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-300 z-50 shadow-2xl active:scale-95"
        title="Cerrar vista previa"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Main Image Container */}
      <div className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center justify-center z-10 animate-in fade-in zoom-in-95 duration-300 pointer-events-none">
        <div className="bg-neutral-900/30 p-2 rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-sm pointer-events-auto">
          <img 
            src={imageUrl} 
            alt={title} 
            className="max-w-full max-h-[75vh] rounded-[1.75rem] object-contain select-none shadow-2xl"
          />
        </div>
        
        {title && (
          <span className="mt-4 px-6 py-2 bg-neutral-900/80 border border-neutral-800 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-[0.2em] text-neutral-300 shadow-xl pointer-events-auto">
            {title}
          </span>
        )}
      </div>
    </div>,
    document.body
  );
};
