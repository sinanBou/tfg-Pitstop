import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClientRegistration } from './useClientRegistration';

// Mocks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

vi.mock('../services/authService', () => ({
  registerClient: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  })
}));

import * as authService from '../services/authService';

describe('useClientRegistration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe inicializar con campos vacíos y sin errores', () => {
    const { result } = renderHook(() => useClientRegistration());

    expect(result.current.formData).toEqual({
      firstname: '', lastname: '', email: '', password: '',
      confirmPassword: '',
      nif: '', phoneNumber: '', address: ''
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('debe registrar un cliente correctamente', async () => {
    const { result } = renderHook(() => useClientRegistration());

    act(() => {
      result.current.handleChange({
        target: { name: 'firstname', value: 'Juan' }
      } as any);
    });

    await act(async () => {
      await result.current.registerClient({ preventDefault: vi.fn() } as any);
    });

    expect(authService.registerClient).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
