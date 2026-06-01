import { getBrandLogo } from '@/assets/BrandLogos';
import type { SearchableSelectProps } from './SearchableSelect.types';
import { useSearchableSelect } from './useSearchableSelect';

export const SearchableSelect = ({ 
  label, 
  placeholder, 
  options, 
  value, 
  onChange, 
  disabled,
  popularOptions,
  popularLabel = "Marcas más populares",
  restLabel = "Resto de marcas"
}: SearchableSelectProps) => {
  const {
    isOpen,
    setIsOpen,
    search,
    setSearch,
    containerRef,
    filteredOptions,
    populars,
    rest,
    handleSelect
  } = useSearchableSelect({ options, popularOptions, onChange });

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <label className="text-[10px] uppercase font-bold text-neutral-500 ml-2">{label}</label>
      <div 
        className={`w-full bg-black/50 border ${isOpen ? 'border-blue-500' : 'border-neutral-800'} rounded-xl p-3 text-sm flex justify-between items-center cursor-pointer transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        data-testid="select-trigger"
      >
        <span className="flex items-center gap-2">
          {value && label.toUpperCase() === 'MARCA' && (
            <span className="text-white flex items-center shrink-0">
              {getBrandLogo(value)}
            </span>
          )}
          <span className={value ? 'text-white' : 'text-neutral-700'}>
            {value || placeholder}
          </span>
        </span>
        <svg className={`w-4 h-4 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-[60] mt-2 w-full bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-3 border-b border-neutral-800 bg-black/20">
            <input 
              type="text" 
              autoFocus
              className="w-full bg-neutral-800 border-none rounded-lg p-2 text-xs text-white placeholder:text-neutral-600 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              data-testid="search-input"
            />
          </div>
          <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700">
            {filteredOptions.length > 0 ? (
              <>
                {populars.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-[9px] uppercase font-black tracking-widest text-neutral-500 bg-neutral-950/20 border-b border-neutral-800/30">
                      {popularLabel}
                    </div>
                    {populars.map((opt, i) => (
                      <button
                        key={`pop-${i}`}
                        type="button"
                        className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors hover:bg-blue-600/20 hover:text-blue-400 ${value === opt ? 'bg-blue-600/10 text-blue-500 font-bold' : 'text-neutral-400'}`}
                        onClick={() => handleSelect(opt)}
                      >
                        {label.toUpperCase() === 'MARCA' && getBrandLogo(opt)}
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                )}

                {rest.length > 0 && (
                  <div>
                    {populars.length > 0 && (
                      <div className="px-4 py-2 text-[9px] uppercase font-black tracking-widest text-neutral-500 bg-neutral-950/20 border-y border-neutral-800/30">
                        {restLabel}
                      </div>
                    )}
                    {rest.map((opt, i) => (
                      <button
                        key={`rest-${i}`}
                        type="button"
                        className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors hover:bg-blue-600/20 hover:text-blue-400 ${value === opt ? 'bg-blue-600/10 text-blue-500 font-bold' : 'text-neutral-400'}`}
                        onClick={() => handleSelect(opt)}
                      >
                        {label.toUpperCase() === 'MARCA' && getBrandLogo(opt)}
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="p-4 text-xs text-neutral-600 text-center italic">No hay resultados</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
