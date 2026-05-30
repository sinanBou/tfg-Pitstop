import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVehicleForm } from './useVehicleForm';

describe('useVehicleForm', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn().mockResolvedValue(true);
  const mockFetchMakes = vi.fn().mockResolvedValue(['BMW', 'Audi']);
  const mockFetchModels = vi.fn().mockResolvedValue(['Serie 3', 'A4']);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe inicializar con valores por defecto', () => {
    const { result } = renderHook(() => useVehicleForm({
      isOpen: false,
      onClose: mockOnClose,
      onSubmit: mockOnSubmit,
      fetchMakes: mockFetchMakes,
      fetchModels: mockFetchModels
    }));

    expect(result.current.loading).toBe(false);
    expect(result.current.makes).toEqual([]);
    expect(result.current.models).toEqual([]);
    expect(result.current.formData.brand).toBe('');
  });

  it('debe cargar marcas cuando isOpen pasa a true', async () => {
    const { result } = renderHook(() => useVehicleForm({
      isOpen: true,
      onClose: mockOnClose,
      onSubmit: mockOnSubmit,
      fetchMakes: mockFetchMakes,
      fetchModels: mockFetchModels
    }));

    // Esperar a que se resuelvan las promesas de los useEffect
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockFetchMakes).toHaveBeenCalled();
    expect(result.current.makes).toEqual(['BMW', 'Audi']);
  });

  it('debe cargar modelos cuando cambia la marca seleccionada', async () => {
    const { result } = renderHook(
      (props) => useVehicleForm(props),
      {
        initialProps: {
          isOpen: true,
          onClose: mockOnClose,
          onSubmit: mockOnSubmit,
          fetchMakes: mockFetchMakes,
          fetchModels: mockFetchModels
        }
      }
    );

    await act(async () => {
      result.current.setFormData((prev) => ({ ...prev, brand: 'BMW' }));
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockFetchModels).toHaveBeenCalledWith('BMW');
    expect(result.current.models).toEqual(['Serie 3', 'A4']);
  });
});
