import React from 'react';

interface BackButtonProps {
  onClick: () => void;
  title?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, title = 'Volver' }) => {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded-xl bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800/80 flex items-center justify-center text-neutral-400 hover:text-white hover:border-red-600/50 transition-all active:scale-95 shadow-inner group relative"
      title={title}
    >
      {/* Subtle brand red dot for garage feel */}
      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-600 opacity-60 group-hover:opacity-100 transition-opacity" />
      
      <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
};
