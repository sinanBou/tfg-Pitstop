import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStaffAppointment } from './useStaffAppointment';

vi.mock('../services/staffAppointmentService', () => ({
  fetchWorkshopSettings: vi.fn().mockResolvedValue({ id: 'w1', companyName: 'Taller Central', workingDays: 'LUNES-VIERNES' }),
  fetchEmployees: vi.fn().mockResolvedValue([{ id: 'e1', name: 'Mecánico 1' }]),
  fetchCatalogMakes: vi.fn().mockResolvedValue(['SEAT', 'BMW']),
  fetchCatalogModels: vi.fn().mockResolvedValue(['Ibiza', 'León']),
  searchClients: vi.fn().mockResolvedValue({ content: [], last: true }),
  searchVehiclesByPlate: vi.fn().mockResolvedValue([]),
  fetchClientVehicles: vi.fn().mockResolvedValue([]),
  manualRegisterClient: vi.fn().mockResolvedValue({ id: 'c1', firstname: 'Juan' }),
  registerVehicleForClient: vi.fn().mockResolvedValue({ id: 'v1', brand: 'SEAT' }),
  fetchAvailabilitySlots: vi.fn().mockResolvedValue([{ time: '09:00:00', available: true }]),
  createStaffAppointment: vi.fn().mockResolvedValue(true)
}));

describe('useStaffAppointment', () => {
  it('debe inicializar con paso 1 y formularios vacíos', async () => {
    const { result } = renderHook(() => useStaffAppointment('w1', vi.fn(), true));
    
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.step).toBe(1);
    expect(result.current.selectedClient).toBeNull();
    expect(result.current.selectedVehicle).toBeNull();
    expect(result.current.clientForm.firstname).toBe('');
    expect(result.current.appointmentForm.date).toBe('');
  });

  it('debe actualizar los pasos de forma secuencial', async () => {
    const { result } = renderHook(() => useStaffAppointment('w1', vi.fn(), true));
    
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.setStep(2);
    });
    expect(result.current.step).toBe(2);

    act(() => {
      result.current.setStep(3);
    });
    expect(result.current.step).toBe(3);
  });

  it('debe resetear correctamente todos los estados al invocar reset', async () => {
    const { result } = renderHook(() => useStaffAppointment('w1', vi.fn(), true));
    
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.setStep(3);
      result.current.setSearchQuery('Query');
    });

    expect(result.current.step).toBe(3);
    expect(result.current.searchQuery).toBe('Query');

    act(() => {
      result.current.reset();
    });

    expect(result.current.step).toBe(1);
    expect(result.current.searchQuery).toBe('');
  });
});
