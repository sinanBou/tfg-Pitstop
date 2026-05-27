import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-neutral-900 bg-black/60 backdrop-blur-md py-12 px-6 relative z-10 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <h1 className="text-xl font-black italic tracking-tighter text-neutral-700 uppercase">PitStop</h1>
        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600">© 2026 Plataforma PitStop. All rights reserved.</p>
      </div>
    </footer>
  );
};
