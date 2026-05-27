import { useState, useCallback } from 'react';
import { API_BASE_URL } from '@/config/api';

export function useVehicleCatalog() {
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMakes = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`${API_BASE_URL}/vehicles/catalog/makes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMakes(data);
      return data;
    } catch (err) {
      console.error("Error fetching makes:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchModels = useCallback(async (make: string) => {
    if (!make) return [];
    setLoading(true);
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`${API_BASE_URL}/vehicles/catalog/models/${make}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setModels(data);
      return data;
    } catch (err) {
      console.error("Error fetching models:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    makes,
    models,
    loading,
    fetchMakes,
    fetchModels
  };
}
