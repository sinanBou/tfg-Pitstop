import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkshopRegistration } from './useWorkshopRegistration';

// Mocks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

vi.mock('../services/authService', () => ({
  registerWorkshop: vi.fn().mockResolvedValue(undefined)
}));

import * as authService from '../services/authService';

describe('useWorkshopRegistration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('alert', vi.fn());
  });

  it('debe inicializar con campos vacíos y sin errores', () => {
    const { result } = renderHook(() => useWorkshopRegistration());

    expect(result.current.formData).toEqual({
      firstname: '', lastname: '', email: '', password: '',
      nif: '', phoneNumber: '', address: ''
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('debe registrar un taller/propietario correctamente', async () => {
    const { result } = renderHook(() => useWorkshopRegistration());

    act(() => {
      result.current.handleChange({
        target: { name: 'firstname', value: 'Pedro' }
      } as any);
    });

    await act(async () => {
      await result.current.registerWorkshop({ preventDefault: vi.fn() } as any);
    });

    expect(authService.registerWorkshop).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
