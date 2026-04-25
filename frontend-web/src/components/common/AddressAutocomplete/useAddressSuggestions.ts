import { useState, useRef, useEffect } from 'react';

interface PhotonFeature {
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export function useAddressSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    let resultsFound = false;

    try {
      const photonRes = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8&lang=es&lat=40.41&lon=-3.70`,
        { signal: abortControllerRef.current.signal }
      );
      
      if (photonRes.ok) {
        const data = await photonRes.json();
        if (data && data.features && data.features.length > 0) {
          const addresses = data.features.map((f: any) => {
            const p = f.properties;
            // Manteo más flexible: si no hay calle, usamos 'name'
            const streetInfo = p.street || p.name || "";
            const house = p.housenumber || "";
            const city = p.city || p.town || p.village || "";
            const parts = [streetInfo, house, city, p.postcode || "", p.state || ""].filter(v => !!v.trim());
            return Array.from(new Set(parts)).join(', ');
          });
          setSuggestions(addresses.filter((a: string) => a.length > 5));
          resultsFound = true;
          console.log("✅ Photon obtuvo resultados:", addresses.length);
        }
      }
    } catch (e: any) {
      if (e.name === 'AbortError') return;
    }

    if (!resultsFound) {
      try {
        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8&addressdetails=1&countrycodes=es`,
          { 
            signal: abortControllerRef.current.signal,
            headers: { 'User-Agent': 'TFG-Pitstop-App' }
          }
        );
        
        if (nomRes.ok) {
          const data = await nomRes.json();
          if (Array.isArray(data) && data.length > 0) {
            const addresses = data.map((item: any) => item.display_name);
            setSuggestions(addresses);
          }
        }
      } catch (e: any) {
        if (e.name === 'AbortError') return;
        setSuggestions([]);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return { suggestions, setSuggestions, isLoading, fetchSuggestions };
}
