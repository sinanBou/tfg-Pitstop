import { useState, useRef, useEffect } from 'react';
import { useAddressController } from '@/components/common/AddressAutocomplete/useAddressController';
import { SuggestionsDropdown } from '@/components/common/AddressAutocomplete/SuggestionsDropdown';
import { StreetInputField } from '@/components/common/AddressAutocomplete/StreetInputField';
import { FloorInputField } from '@/components/common/AddressAutocomplete/FloorInputField';

interface AddressAutocompleteProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export default function AddressAutocomplete({ label, value, onChange, error, placeholder }: AddressAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const addr = useAddressController(value, onChange);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (addr.suggestions.length > 0) {
      setIsOpen(true);
    }
  }, [addr.suggestions]);

  return (
    <div className="w-full relative group z-50" ref={containerRef}>
      <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 ml-1 block mb-1.5">
        {label}
      </label>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <StreetInputField value={addr.inputValue} onChange={addr.handleStreetChange} isLoading={addr.isLoading} onFocus={() => { if (addr.suggestions.length > 0) setIsOpen(true); }} placeholder={placeholder} error={!!error} />
          <SuggestionsDropdown suggestions={addr.suggestions} isOpen={isOpen} onSelect={(s) => { addr.handleSelectSuggestion(s); setIsOpen(false); }} />
        </div>
        <FloorInputField value={addr.floorDetail} onChange={addr.handleFloorChange} />
      </div>
      {error && <p className="text-red-500 text-[10px] mt-1.5 ml-1 font-black uppercase tracking-widest animate-fade-in">{error}</p>}
    </div>
  );
}
