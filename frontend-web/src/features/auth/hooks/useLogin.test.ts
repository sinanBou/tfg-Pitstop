import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock de react-router-dom usando vi.hoisted para evitar problemas de hoisting de ESM
const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

vi.mock('../services/authService', () => ({
  login: vi.fn().mockResolvedValue({ token: 'mock-token', role: 'CLIENT' })
}));

import { useLogin } from './useLogin';
import * as authService from '../services/authService';

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('alert', vi.fn());
    
    // Stub de localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn()
    };
    vi.stubGlobal('localStorage', localStorageMock);
  });

  it('debe inicializar con campos vacíos y sin errores', () => {
    const { result } = renderHook(() => useLogin());

    expect(result.current.formData).toEqual({ email: '', password: '' });
    expect(result.current.errors).toEqual({});
    expect(result.current.isLoading).toBe(false);
  });

  it('debe manejar los cambios en los inputs', () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'test@example.com' }
      } as any);
    });

    expect(result.current.formData.email).toBe('test@example.com');
  });

  it('debe validar campos obligatorios', async () => {
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.handleLogin({ preventDefault: vi.fn() } as any);
    });

    expect(result.current.errors).toEqual({
      email: 'Email obligatorio',
      password: 'Contraseña obligatoria'
    });
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('debe iniciar sesión con éxito y navegar según el rol', async () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.handleChange({ target: { name: 'email', value: 'client@example.com' } } as any);
      result.current.handleChange({ target: { name: 'password', value: 'password123' } } as any);
    });

    await act(async () => {
      await result.current.handleLogin({ preventDefault: vi.fn() } as any);
    });

    expect(authService.login).toHaveBeenCalledWith({
      email: 'client@example.com',
      password: 'password123'
    });
    expect(localStorage.setItem).toHaveBeenCalledWith('jwt_token', 'mock-token');
    expect(localStorage.setItem).toHaveBeenCalledWith('role', 'CLIENT');
    expect(mockNavigate).toHaveBeenCalledWith('/client-dashboard');
  });
});
