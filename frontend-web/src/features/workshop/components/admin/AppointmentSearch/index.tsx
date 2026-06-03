import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Building2, ArrowRight } from '@/assets/icons';

interface AppointmentSearchProps {
  appointments: any[];
  onSelectDate: (date: Date) => void;
}

export const AppointmentSearch: React.FC<AppointmentSearchProps> = ({ appointments, onSelectDate }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = query.trim().length >= 2 
    ? appointments.filter(app => 
        app.vehicleDisplay?.toLowerCase().includes(query.toLowerCase()) ||
        app.clientFullName?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
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

  const handleSelect = (dateTime: string) => {
    const date = new Date(dateTime);
    date.setHours(0,0,0,0);
    onSelectDate(date);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative group" ref={containerRef}>
      <div className="relative flex items-center">
        <div className="absolute left-4 text-neutral-500 group-hover:text-red-500 transition-colors pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
        <input 
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar matrícula o cliente..."
          className="bg-white/5 border border-white/10 hover:border-white/20 focus:border-red-500/50 focus:bg-white/10 text-white pl-12 pr-6 h-[54px] rounded-xl text-xs font-bold w-64 md:w-80 outline-none transition-all placeholder:text-neutral-600 shadow-2xl"
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute right-4 text-neutral-600 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" strokeWidth={3} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 space-y-1">
            {results.map((app) => (
              <button 
                key={app.id}
                onClick={() => handleSelect(app.dateTime)}
                className="w-full flex items-center gap-4 p-3 hover:bg-red-600/10 rounded-xl transition-all group/item text-left border border-transparent hover:border-red-500/20"
              >
                <div className="w-10 h-10 bg-neutral-800/50 rounded-lg flex items-center justify-center shrink-0 border border-neutral-700 group-hover/item:border-red-500/30">
                  <Building2 className="w-5 h-5 text-neutral-500 group-hover/item:text-red-500 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="text-white font-black uppercase text-[11px] truncate tracking-tight">{app.vehicleDisplay}</span>
                    <span className="text-neutral-500 text-[9px] font-mono shrink-0 ml-2">{new Date(app.dateTime).toLocaleDateString()}</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 font-bold uppercase truncate group-hover/item:text-neutral-300 transition-colors">
                    {app.clientFullName || 'Cliente anon.'}
                  </div>
                </div>
                <div className="shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity pr-2">
                   <ArrowRight className="w-4 h-4 text-red-500" />
                </div>
              </button>
            ))}
          </div>
          <div className="bg-neutral-950/50 p-2 border-t border-neutral-800 flex justify-center">
             <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600 italic">Resultados para "{query}"</span>
          </div>
        </div>
      )}
    </div>
  );
};
