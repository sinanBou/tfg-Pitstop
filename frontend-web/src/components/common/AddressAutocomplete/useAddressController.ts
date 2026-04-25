import { useState, useEffect, useRef } from 'react';
import { useAddressSuggestions } from './useAddressSuggestions';

export function useAddressController(initialValue: string, onParentChange: (val: string) => void) {
  const { suggestions, setSuggestions, isLoading, fetchSuggestions } = useAddressSuggestions();
  const [baseAddress, setBaseAddress] = useState('');
  const [floorDetail, setFloorDetail] = useState('');
  const [inputValue, setInputValue] = useState('');
  const timeoutRef = useRef<any>(null);

  // Sincronización DB -> Local
  useEffect(() => {
    const isCurrentValue = (baseAddress + (floorDetail ? `, ${floorDetail}` : '')) === initialValue;
    if (initialValue && !isCurrentValue) {
      const lastCommaIndex = initialValue.lastIndexOf(',');
      if (lastCommaIndex !== -1 && initialValue.length - lastCommaIndex < 15) {
        const base = initialValue.substring(0, lastCommaIndex).trim();
        const floor = initialValue.substring(lastCommaIndex + 1).trim();
        setBaseAddress(base);
        setFloorDetail(floor);
        setInputValue(base);
      } else {
        setBaseAddress(initialValue);
        setInputValue(initialValue);
      }
    }
  }, [initialValue]);

  const updateParent = (base: string, floor: string) => {
    onParentChange(floor ? `${base}, ${floor}` : base);
  };

  const handleStreetChange = (val: string) => {
    setInputValue(val);
    setBaseAddress(val);
    updateParent(val, floorDetail);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (val.length > 2) {
      timeoutRef.current = setTimeout(() => fetchSuggestions(val), 200);
    } else {
      setSuggestions([]);
    }
  };

  const handleFloorChange = (val: string) => {
    setFloorDetail(val);
    updateParent(baseAddress, val);
  };

  const handleSelectSuggestion = (address: string) => {
    setInputValue(address);
    setBaseAddress(address);
    updateParent(address, floorDetail);
    setSuggestions([]);
  };

  return {
    baseAddress,
    floorDetail,
    inputValue,
    suggestions,
    isLoading,
    handleStreetChange,
    handleFloorChange,
    handleSelectSuggestion,
    setSuggestions
  };
}
