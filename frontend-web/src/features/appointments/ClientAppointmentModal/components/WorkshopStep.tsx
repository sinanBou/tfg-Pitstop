import React from 'react';
import type { WorkshopMinDTO } from '@/features/client';
import { Search, Building, MapPin } from '@/assets/icons';
import { useTranslation } from '@/i18n';

interface WorkshopStepProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  searchResults: WorkshopMinDTO[];
  selectedWorkshopId: string;
  onSelect: (workshopId: string) => void;
  isSearching: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onPreviewLogo: (url: string, title: string) => void;
}

export const WorkshopStep: React.FC<WorkshopStepProps> = ({
  searchTerm,
  onSearchTermChange,
  searchResults,
  selectedWorkshopId,
  onSelect,
  isSearching,
  hasMore,
  onLoadMore,
  onPreviewLogo
}) => {
  const { t } = useTranslation();

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex-1 flex flex-col">
      {/* BARRA DE BÚSQUEDA */}
      <div className="relative mb-6">
        <input 
          type="text"
          autoFocus
          placeholder={t('appointmentModal.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="w-full bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 pl-12 text-sm text-white focus:outline-none focus:border-blue-600/50 focus:bg-black transition-all placeholder-neutral-600"
        />
        <Search className="w-5 h-5 text-neutral-600 absolute left-4 top-1/2 -translate-y-1/2" />
      </div>

      <div className="grid gap-3 flex-1 overflow-y-auto pr-1 max-h-[350px] custom-scrollbar scroll-smooth">
        {searchResults.map(w => (
          <button 
            key={w.id}
            type="button"
            onClick={() => onSelect(w.id)}
            className={`p-5 rounded-2xl border transition-all text-left flex items-start gap-4 group ${
              selectedWorkshopId === w.id ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'border-neutral-800 bg-black/40 hover:border-blue-500/50 hover:bg-neutral-900/60'
            }`}
          >
            <div className={`w-12 h-12 shrink-0 rounded-xl overflow-hidden flex items-center justify-center transition-colors ${selectedWorkshopId === w.id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-neutral-800 text-neutral-400 group-hover:text-blue-400 border border-neutral-700/50'}`}>
               {w.logoPictureUrl ? (
                  <img 
                     src={w.logoPictureUrl} 
                     alt="Logo" 
                     onClick={(e) => {
                        e.stopPropagation();
                        onPreviewLogo(w.logoPictureUrl!, w.companyName);
                      }}
                     className="w-full h-full object-cover cursor-zoom-in hover:scale-110 transition-transform duration-300"
                  />
               ) : (
                  <Building className="w-6 h-6" strokeWidth={1.5} />
               )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                 <p className="text-lg text-white font-black uppercase tracking-wide group-hover:text-blue-400 transition-colors">{w.companyName}</p>
                 {w.cif && <span className="text-[9px] font-mono text-neutral-600 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">{w.cif}</span>}
              </div>
              {w.address && (
                 <p className="text-xs text-neutral-400 font-mono tracking-tight flex items-center gap-1.5 mb-2">
                   <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                   {w.address}
                 </p>
              )}
            </div>
          </button>
        ))}

        {isSearching && (
          <div className="py-8 flex flex-col items-center gap-2 opacity-50">
             <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">{t('appointmentModal.searching')}</p>
          </div>
        )}

        {!isSearching && hasMore && searchResults.length > 0 && (
          <button 
            type="button"
            onClick={onLoadMore}
            className="w-full py-4 bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-all shadow-sm"
          >
            {t('appointmentModal.loadMoreWorkshops')}
          </button>
        )}

        {!isSearching && searchResults.length === 0 && (
          <div className="py-12 text-center border-2 border-dashed border-neutral-800 rounded-3xl bg-neutral-900/20">
             <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest animate-pulse">{t('appointmentModal.noResults')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
