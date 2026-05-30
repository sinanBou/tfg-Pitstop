import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mocks usando vi.hoisted
const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

vi.mock('../services/clientService', () => ({
  getUserProfile: vi.fn().mockResolvedValue({ id: '1', firstname: 'Juan', lastname: 'Pérez', email: 'juan@example.com', role: 'CLIENT' }),
  getClientProfile: vi.fn().mockResolvedValue({ id: '1', address: 'Calle 123' }),
  getMyVehicles: vi.fn().mockResolvedValue([{ id: 'v1', brand: 'BMW', model: 'Serie 3', licensePlate: '1234ABC' }]),
  getWorkshops: vi.fn().mockResolvedValue([{ id: 'w1', companyName: 'Taller Central' }]),
  getMyAppointments: vi.fn().mockResolvedValue([{ id: 'a1', dateTime: '2026-06-01T10:00:00', status: 'PENDING', description: 'Revisión' }]),
  registerVehicle: vi.fn().mockResolvedValue(true),
  createAppointment: vi.fn().mockResolvedValue(true),
  getAvailableSlots: vi.fn().mockResolvedValue(['09:00', '10:00']),
  deleteAppointment: vi.fn().mockResolvedValue(true),
  deleteVehicle: vi.fn().mockResolvedValue(true),
  getCatalogMakes: vi.fn().mockResolvedValue(['BMW', 'Audi']),
  getCatalogModels: vi.fn().mockResolvedValue(['Serie 3', 'A4']),
  updateProfile: vi.fn().mockResolvedValue({ id: '1', address: 'Calle Nueva' })
}));

import { useClientDashboard } from './useClientDashboard';
import * as clientService from '../services/clientService';

describe('useClientDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Stub de localStorage
    const localStorageMock = {
      getItem: vi.fn((key) => {
        if (key === 'jwt_token') return 'mock-token';
        if (key === 'role') return 'CLIENT';
        return null;
      }),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn()
    };
    vi.stubGlobal('localStorage', localStorageMock);
  });

  it('debe inicializar y cargar los datos del dashboard correctamente', async () => {
    const { result } = renderHook(() => useClientDashboard());

    // Esperar a que se resuelvan las promesas
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    });

    expect(clientService.getUserProfile).toHaveBeenCalled();
    expect(clientService.getClientProfile).toHaveBeenCalled();
    expect(clientService.getMyVehicles).toHaveBeenCalled();
    expect(result.current.userProfile?.firstname).toBe('Juan');
    expect(result.current.vehicles).toHaveLength(1);
    expect(result.current.appointments).toHaveLength(1);
  });

  it('debe permitir registrar un vehículo', async () => {
    const { result } = renderHook(() => useClientDashboard());

    let success = false;
    await act(async () => {
      success = await result.current.registerVehicle({
        brand: 'BMW', model: 'Serie 3', licensePlate: '1234ABC', vin: '123', year: 2020, color: 'Rojo'
      });
    });

    expect(clientService.registerVehicle).toHaveBeenCalled();
    expect(success).toBe(true);
  });

  it('debe permitir crear una cita', async () => {
    const { result } = renderHook(() => useClientDashboard());

    let success = false;
    await act(async () => {
      success = await result.current.createAppointment({
        vehicleId: 'v1', workshopId: 'w1', date: '2026-06-01', time: '10:00', serviceType: 'Revisión', description: 'Revisión'
      });
    });

    expect(clientService.createAppointment).toHaveBeenCalled();
    expect(success).toBe(true);
  });

  it('debe permitir eliminar una cita', async () => {
    const { result } = renderHook(() => useClientDashboard());

    let success = false;
    await act(async () => {
      success = await result.current.deleteAppointment('a1');
    });

    expect(clientService.deleteAppointment).toHaveBeenCalledWith('a1');
    expect(success).toBe(true);
  });
});
