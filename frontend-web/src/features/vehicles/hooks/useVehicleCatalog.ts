import { useState, useCallback } from 'react';
import * as vehicleService from '../services/vehicleService';

/**
 * Hook personalizado para gestionar el catálogo dinámico de vehículos (marcas y modelos).
 * Proporciona estados locales y funciones asíncronas optimizadas con useCallback para
 * cargar marcas globales y filtrar modelos a partir de una marca seleccionada.
 */
export function useVehicleCatalog() {
  /** Listado de marcas de vehículos cargadas. */
  const [makes, setMakes] = useState<string[]>([]);
  /** Listado de modelos filtrados por marca. */
  const [models, setModels] = useState<string[]>([]);
  /** Estado de carga asíncrona de los datos. */
  const [loading, setLoading] = useState(false);

  /**
   * Obtiene el listado completo de marcas disponibles en el catálogo.
   * @returns Promesa con el listado de marcas cargadas.
   */
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

  /**
   * Obtiene y filtra la lista de modelos de coche asociados a una marca específica.
   * @param make Nombre de la marca seleccionada.
   * @returns Promesa con los modelos de coche filtrados.
   */
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

