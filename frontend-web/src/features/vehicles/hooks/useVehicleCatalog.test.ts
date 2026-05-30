import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../services/vehicleService', () => ({
  getCatalogMakes: vi.fn().mockResolvedValue(['BMW', 'Audi']),
  getCatalogModels: vi.fn().mockResolvedValue(['Serie 3', 'A4'])
}));

import { useVehicleCatalog } from './useVehicleCatalog';
import * as vehicleService from '../services/vehicleService';

describe('useVehicleCatalog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe inicializar con marcas y modelos vacíos y sin estar cargando', () => {
    const { result } = renderHook(() => useVehicleCatalog());

    expect(result.current.makes).toEqual([]);
    expect(result.current.models).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('debe obtener y actualizar las marcas correctamente', async () => {
    const { result } = renderHook(() => useVehicleCatalog());

    let data: string[] = [];
    await act(async () => {
      data = await result.current.fetchMakes();
    });

    expect(vehicleService.getCatalogMakes).toHaveBeenCalled();
    expect(data).toEqual(['BMW', 'Audi']);
    expect(result.current.makes).toEqual(['BMW', 'Audi']);
  });

  it('debe obtener y actualizar los modelos correctamente', async () => {
    const { result } = renderHook(() => useVehicleCatalog());

    let data: string[] = [];
    await act(async () => {
      data = await result.current.fetchModels('BMW');
    });

    expect(vehicleService.getCatalogModels).toHaveBeenCalledWith('BMW');
    expect(data).toEqual(['Serie 3', 'A4']);
    expect(result.current.models).toEqual(['Serie 3', 'A4']);
  });
});
