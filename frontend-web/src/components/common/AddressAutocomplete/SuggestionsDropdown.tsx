import React from 'react';

interface SuggestionsDropdownProps {
  suggestions: string[];
  onSelect: (address: string) => void;
  isOpen: boolean;
}

export const SuggestionsDropdown: React.FC<SuggestionsDropdownProps> = ({ suggestions, onSelect, isOpen }) => {
  if (!isOpen || suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden z-[200] shadow-[0_10px_40px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-2 duration-200">
      {suggestions.map((s, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(s)}
          className="w-full text-left p-4 hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors text-xs font-semibold border-b border-neutral-900 last:border-0"
        >
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {s}
          </div>
        </button>
      ))}
    </div>
  );
};
