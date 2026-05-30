import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClientAppointment } from './useClientAppointment';

describe('useClientAppointment', () => {
  const mockWorkshops = [
    { id: 'w1', companyName: 'Taller Central', workingDays: 'LUNES,MARTES,MIERCOLES,JUEVES,VIERNES' }
  ];
  const mockOnSubmit = vi.fn().mockResolvedValue(true);
  const mockFetchSlots = vi.fn().mockResolvedValue(['09:00', '10:00', '11:00']);

  it('debe inicializar con paso 1 y valores por defecto', () => {
    const { result } = renderHook(() => useClientAppointment({
      isOpen: true,
      onClose: vi.fn(),
      workshops: mockWorkshops,
      onSubmit: mockOnSubmit,
      fetchSlots: mockFetchSlots
    }));

    expect(result.current.step).toBe(1);
    expect(result.current.formData).toEqual({
      vehicleId: '',
      workshopId: '',
      date: '',
      time: '',
      serviceType: '',
      description: ''
    });
    expect(result.current.error).toBeNull();
  });

  it('debe avanzar de paso usando nextStep y retroceder con prevStep', () => {
    const { result } = renderHook(() => useClientAppointment({
      isOpen: true,
      onClose: vi.fn(),
      workshops: mockWorkshops,
      onSubmit: mockOnSubmit,
      fetchSlots: mockFetchSlots
    }));

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.step).toBe(2);

    act(() => {
      result.current.prevStep();
    });

    expect(result.current.step).toBe(1);
  });

  it('debe detectar citas duplicadas al avanzar de paso', () => {
    const existingAppointments = [
      { vehicleId: 'v1', workshopId: 'w1', status: 'CONFIRMED' }
    ];

    const { result } = renderHook(() => useClientAppointment({
      isOpen: true,
      onClose: vi.fn(),
      workshops: mockWorkshops,
      onSubmit: mockOnSubmit,
      fetchSlots: mockFetchSlots,
      existingAppointments
    }));

    // Seteamos el mismo vehículo y taller que ya tiene una cita activa
    act(() => {
      result.current.setFormData(prev => ({
        ...prev,
        vehicleId: 'v1',
        workshopId: 'w1'
      }));
    });

    // Simulamos estar en paso 2 y querer avanzar
    act(() => {
      result.current.setStep(2);
    });

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.error).toBe('Ya tienes una cita asignada para este taller con este vehículo.');
    expect(result.current.step).toBe(2); // No debe avanzar al paso 3
  });

  it('debe enviar la cita correctamente y resetear el estado', async () => {
    const mockOnClose = vi.fn();
    const { result } = renderHook(() => useClientAppointment({
      isOpen: true,
      onClose: mockOnClose,
      workshops: mockWorkshops,
      onSubmit: mockOnSubmit,
      fetchSlots: mockFetchSlots
    }));

    act(() => {
      result.current.setFormData({
        vehicleId: 'v1',
        workshopId: 'w1',
        date: '2026-06-01',
        time: '09:00',
        serviceType: 'Revisión',
        description: 'Cambio de aceite'
      });
    });

    await act(async () => {
      await result.current.handleFinish();
    });

    expect(mockOnSubmit).toHaveBeenCalledWith({
      vehicleId: 'v1',
      workshopId: 'w1',
      date: '2026-06-01',
      time: '09:00',
      serviceType: 'Revisión',
      description: 'Cambio de aceite'
    });
    expect(mockOnClose).toHaveBeenCalled();
    expect(result.current.step).toBe(1);
    expect(result.current.formData.vehicleId).toBe('');
  });
});
