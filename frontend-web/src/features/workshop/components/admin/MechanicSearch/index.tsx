import React, { useState, useRef, useEffect } from 'react';
import { User } from '@/assets/icons';
import { useTranslation } from '@/i18n';

interface Mechanic {
  id: string;
  firstname: string;
  lastname: string;
  role: string;
}

interface MechanicSearchProps {
  mechanics: Mechanic[];
  onSelectMechanic: (id: string) => void;
}

export const MechanicSearch: React.FC<MechanicSearchProps> = ({ mechanics, onSelectMechanic }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = query.trim().length >= 2 
    ? mechanics.filter(m => 
        (m.firstname + ' ' + m.lastname).toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    onSelectMechanic(id);
    setQuery('');
    setIsOpen(false);
    
    // Feedback visual opcional: scroll to column
    const element = document.getElementById(`column-${id}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        // Resaltar brevemente
        element.classList.add('ring-2', 'ring-red-500', 'ring-inset');
        setTimeout(() => element.classList.remove('ring-2', 'ring-red-500', 'ring-inset'), 2000);
    }
  };

  return (
    <div className="relative group" ref={containerRef}>
      <div className="relative flex items-center">
        <div className="absolute left-4 text-neutral-500 group-hover:text-blue-500 transition-colors pointer-events-none">
          <User className="w-4 h-4" />
        </div>
        <input 
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder={t('mechanicSearch.placeholder')}
          className="bg-white/5 border border-white/10 hover:border-white/20 focus:border-blue-500/50 focus:bg-white/10 text-white pl-12 pr-6 h-[54px] rounded-xl text-xs font-bold w-48 md:w-60 outline-none transition-all placeholder:text-neutral-600 shadow-2xl"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 space-y-1">
            {results.map((m) => (
              <button 
                key={m.id}
                onClick={() => handleSelect(m.id)}
                className="w-full flex items-center gap-3 p-2.5 hover:bg-blue-600/10 rounded-xl transition-all group/item text-left border border-transparent hover:border-blue-500/20"
              >
                <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center shrink-0 border border-neutral-700 group-hover/item:border-blue-500/30">
                   <span className="text-[10px] font-black text-neutral-400 group-hover/item:text-blue-500">{m.firstname[0]}{m.lastname[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                   <div className="text-white font-black uppercase text-[10px] truncate">{m.firstname} {m.lastname}</div>
                   <div className="text-[8px] text-neutral-500 font-bold uppercase">{m.role === 'WORKSHOP_MANAGER' ? t('mechanicSearch.manager') : t('mechanicSearch.mechanic')}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
