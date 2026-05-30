import { useState, useRef, useEffect } from 'react';

interface UseSearchableSelectProps {
  options: string[];
  popularOptions?: string[];
  onChange: (value: string) => void;
}

export function useSearchableSelect({ options, popularOptions, onChange }: UseSearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const populars = popularOptions
    ? filteredOptions.filter(opt => popularOptions.some(p => p.toUpperCase() === opt.toUpperCase()))
    : [];
  const rest = popularOptions
    ? filteredOptions.filter(opt => !popularOptions.some(p => p.toUpperCase() === opt.toUpperCase()))
    : filteredOptions;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearch('');
  };

  return {
    isOpen,
    setIsOpen,
    search,
    setSearch,
    containerRef,
    filteredOptions,
    populars,
    rest,
    handleSelect
  };
}
