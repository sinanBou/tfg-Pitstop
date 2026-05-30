import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock de react-router-dom con vi.hoisted para evitar problemas de hoisting de ESM
const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

const mockEmployeeMe = {
  id: 'emp-1',
  firstname: 'Juan',
  lastname: 'Pérez',
  address: 'Calle Falsa 123',
  nif: '12345678A',
  phoneNumber: '600123456',
  avatarUrl: 'http://avatar.url'
};

const mockUserMe = {
  employeeId: 'emp-1'
};

const mockWorkshops = [
  { id: 'ws-1', companyName: 'Talleres Pérez', cif: 'B12345678', address: 'Calle Taller 123', workingDays: 'LUNES-VIERNES', openTime: '09:00', closeTime: '18:00', slotDurationMinutes: 60 }
];

let dynamicEmployeeMe = { ...mockEmployeeMe };

vi.mock('../services/workshopService', () => ({
  getEmployeeMe: vi.fn(() => Promise.resolve(dynamicEmployeeMe)),
  getUserMe: vi.fn(() => Promise.resolve(mockUserMe)),
  getWorkshopsByOwner: vi.fn(() => Promise.resolve(mockWorkshops)),
  updateEmployeeMe: vi.fn((data) => {
    dynamicEmployeeMe = { ...dynamicEmployeeMe, ...data };
    return Promise.resolve(dynamicEmployeeMe);
  }),
  uploadAvatar: vi.fn(() => {
    dynamicEmployeeMe = { ...dynamicEmployeeMe, avatarUrl: 'http://new-avatar.url' };
    return Promise.resolve(dynamicEmployeeMe);
  }),
  deleteAvatar: vi.fn(() => {
    dynamicEmployeeMe = { ...dynamicEmployeeMe, avatarUrl: undefined as any };
    return Promise.resolve(dynamicEmployeeMe);
  })
}));

import { useOwnerDashboard } from './useOwnerDashboard';
import * as workshopService from '../services/workshopService';

describe('useOwnerDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dynamicEmployeeMe = { ...mockEmployeeMe };
    
    // Stub de localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn()
    };
    vi.stubGlobal('localStorage', localStorageMock);
  });

  it('debe inicializar y cargar los datos correctamente', async () => {
    const { result } = renderHook(() => useOwnerDashboard());

    // Inicialmente cargando
    expect(result.current.loading).toBe(true);

    // Esperar a que se resuelvan los useEffects
    await act(async () => {
      await Promise.resolve();
    });

    expect(workshopService.getUserMe).toHaveBeenCalled();
    expect(workshopService.getWorkshopsByOwner).toHaveBeenCalledWith('emp-1');
    expect(workshopService.getEmployeeMe).toHaveBeenCalled();

    expect(result.current.loading).toBe(false);
    expect(result.current.ownerId).toBe('emp-1');
    expect(result.current.workshops).toEqual(mockWorkshops);
    expect(result.current.employeeProfile).toEqual(mockEmployeeMe);
  });

  it('debe redirigir al login si falla la autenticación', async () => {
    vi.mocked(workshopService.getUserMe).mockRejectedValueOnce(new Error('No autenticado'));
    
    const { result } = renderHook(() => useOwnerDashboard());

    await act(async () => {
      await Promise.resolve();
    });

    expect(localStorage.clear).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(result.current.loading).toBe(false);
  });

  it('debe actualizar el perfil correctamente', async () => {
    const { result } = renderHook(() => useOwnerDashboard());

    await act(async () => {
      await Promise.resolve();
    });

    const updateData = {
      firstname: 'Carlos',
      lastname: 'Gómez',
      address: 'Calle Nueva 456',
      nif: '87654321B',
      phoneNumber: '654321098'
    };

    await act(async () => {
      await result.current.handleProfileUpdate(updateData);
    });

    expect(workshopService.updateEmployeeMe).toHaveBeenCalledWith(updateData);
    expect(result.current.employeeProfile?.firstname).toBe('Carlos');
  });

  it('debe subir el avatar correctamente', async () => {
    const { result } = renderHook(() => useOwnerDashboard());

    await act(async () => {
      await Promise.resolve();
    });

    const mockFile = new File([''], 'avatar.png', { type: 'image/png' });
    let success = false;
    await act(async () => {
      success = await result.current.handleUploadAvatar(mockFile);
    });

    expect(workshopService.uploadAvatar).toHaveBeenCalledWith(mockFile);
    expect(success).toBe(true);
    expect(result.current.employeeProfile?.avatarUrl).toBe('http://new-avatar.url');
  });

  it('debe eliminar el avatar correctamente', async () => {
    const { result } = renderHook(() => useOwnerDashboard());

    await act(async () => {
      await Promise.resolve();
    });

    let success = false;
    await act(async () => {
      success = await result.current.handleDeleteAvatar();
    });

    expect(workshopService.deleteAvatar).toHaveBeenCalled();
    expect(success).toBe(true);
    expect(result.current.employeeProfile?.avatarUrl).toBeUndefined();
  });
});
