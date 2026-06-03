import React from 'react';
import { MapPin } from '@/assets/icons';

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
            <MapPin className="w-4 h-4 shrink-0 text-red-500" />
            {s}
          </div>
        </button>
      ))}
    </div>
  );
};
