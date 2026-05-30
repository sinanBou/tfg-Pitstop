import { useState, useCallback } from 'react';
import * as vehicleService from '../services/vehicleService';

export function useVehicleCatalog() {
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMakes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vehicleService.getCatalogMakes();
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
    try {
      const data = await vehicleService.getCatalogModels(make);
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
