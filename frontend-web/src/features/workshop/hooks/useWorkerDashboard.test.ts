import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

const mockEmployeeMe = {
  id: 'emp-2',
  firstname: 'Luis',
  lastname: 'Gómez',
  address: 'Calle Taller 55',
  workshopId: 'ws-1'
};

const mockAppointments = [
  { id: 'app-1', dateTime: '2026-06-01T10:00:00', status: 'PENDING', assignedEmployeeId: null },
  { id: 'app-2', dateTime: '2026-06-02T12:00:00', status: 'CONFIRMED', assignedEmployeeId: 'emp-2' }
];

const mockTasks = [
  { id: 'task-1', dateTime: '2026-06-01T10:00:00', status: 'IN_PROGRESS', assignedEmployeeId: 'emp-2' }
];

const mockEmployees = [
  { id: 'emp-2', firstname: 'Luis', lastname: 'Gómez', address: 'Calle Taller 55', workshopId: 'ws-1' }
];

const mockWorkshop = {
  id: 'ws-1',
  companyName: 'Talleres Pérez',
  cif: 'B12345678',
  address: 'Calle Taller 123',
  workingDays: 'LUNES-VIERNES',
  openTime: '09:00',
  closeTime: '18:00',
  slotDurationMinutes: 60
};

import type { EmployeeProfile } from '../types/workshop.types';

let dynamicEmployee: EmployeeProfile = { ...mockEmployeeMe };

vi.mock('../services/workshopService', () => ({
  getEmployeeMe: vi.fn(() => Promise.resolve(dynamicEmployee)),
  getAppointmentsByWorkshop: vi.fn(() => Promise.resolve(mockAppointments)),
  getTasksByWorkshopAndDate: vi.fn(() => Promise.resolve(mockTasks)),
  getEmployeesByWorkshop: vi.fn(() => Promise.resolve(mockEmployees)),
  getWorkshopById: vi.fn(() => Promise.resolve(mockWorkshop)),
  getAppointmentsReadyForCompletion: vi.fn(() => Promise.resolve([])),
  assignAppointment: vi.fn(() => Promise.resolve()),
  rescheduleAppointment: vi.fn(() => Promise.resolve()),
  updateAppointmentStatus: vi.fn(() => Promise.resolve()),
  updateTaskStatus: vi.fn(() => Promise.resolve()),
  rescheduleTask: vi.fn(() => Promise.resolve()),
  deleteTask: vi.fn(() => Promise.resolve()),
  deleteAppointment: vi.fn(() => Promise.resolve()),
  checkInVehicle: vi.fn(() => Promise.resolve()),
  updateEmployeeMe: vi.fn((data) => {
    dynamicEmployee = { ...dynamicEmployee, ...data };
    return Promise.resolve(dynamicEmployee);
  }),
  uploadAvatar: vi.fn(() => {
    dynamicEmployee = { ...dynamicEmployee, avatarUrl: 'http://new-avatar.url' };
    return Promise.resolve(dynamicEmployee);
  }),
  deleteAvatar: vi.fn(() => {
    dynamicEmployee = { ...dynamicEmployee, avatarUrl: undefined };
    return Promise.resolve(dynamicEmployee);
  })
}));

import { useWorkerDashboard } from './useWorkerDashboard';
import * as workshopService from '../services/workshopService';

describe('useWorkerDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dynamicEmployee = { ...mockEmployeeMe };
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

  it('debe inicializar y cargar los datos correctamente cuando tiene workshopId', async () => {
    const { result } = renderHook(() => useWorkerDashboard());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(workshopService.getEmployeeMe).toHaveBeenCalled();
    expect(workshopService.getAppointmentsByWorkshop).toHaveBeenCalledWith('ws-1');
    expect(workshopService.getTasksByWorkshopAndDate).toHaveBeenCalled();
    expect(workshopService.getEmployeesByWorkshop).toHaveBeenCalledWith('ws-1');
    expect(workshopService.getWorkshopById).toHaveBeenCalledWith('ws-1');
    expect(workshopService.getAppointmentsReadyForCompletion).toHaveBeenCalledWith('ws-1');

    expect(result.current.loading).toBe(false);
    expect(result.current.employeeProfile).toEqual(mockEmployeeMe);
    expect(result.current.appointments).toEqual(mockAppointments);
    expect(result.current.workshopTasks).toEqual(mockTasks);
    expect(result.current.employees).toEqual(mockEmployees);
    expect(result.current.workshopData).toEqual(mockWorkshop);
  });

  it('debe asignar cita correctamente', async () => {
    const { result } = renderHook(() => useWorkerDashboard());

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.handleAssignAppointment('app-1', 'emp-2');
    });

    expect(workshopService.assignAppointment).toHaveBeenCalledWith('app-1', 'emp-2');
    expect(workshopService.getAppointmentsByWorkshop).toHaveBeenCalled();
  });

  it('debe reubicar cita correctamente', async () => {
    const { result } = renderHook(() => useWorkerDashboard());

    await act(async () => {
      await Promise.resolve();
    });

    const newDate = new Date('2026-06-03T14:00:00');
    await act(async () => {
      await result.current.handleRescheduleAppointment('app-1', 'emp-2', newDate, 60);
    });

    expect(workshopService.rescheduleAppointment).toHaveBeenCalled();
  });

  it('debe actualizar estado de cita correctamente', async () => {
    const { result } = renderHook(() => useWorkerDashboard());

    await act(async () => {
      await Promise.resolve();
    });

    let success = false;
    await act(async () => {
      success = await result.current.updateAppointmentStatus('app-1', 'IN_PROGRESS');
    });

    expect(workshopService.updateAppointmentStatus).toHaveBeenCalledWith('app-1', 'IN_PROGRESS');
    expect(success).toBe(true);
  });

  it('debe actualizar estado de tarea correctamente', async () => {
    const { result } = renderHook(() => useWorkerDashboard());

    await act(async () => {
      await Promise.resolve();
    });

    let success = false;
    await act(async () => {
      success = await result.current.updateTaskStatus('task-1', 'COMPLETED');
    });

    expect(workshopService.updateTaskStatus).toHaveBeenCalledWith('task-1', 'COMPLETED');
    expect(success).toBe(true);
  });

  it('debe recepcionar vehículo (check-in) correctamente', async () => {
    const { result } = renderHook(() => useWorkerDashboard());

    await act(async () => {
      await Promise.resolve();
    });

    let success = false;
    await act(async () => {
      success = await result.current.checkInVehicle('app-1', 120000, 'Tiene un arañazo lateral');
    });

    expect(workshopService.checkInVehicle).toHaveBeenCalledWith('app-1', 120000, 'Tiene un arañazo lateral');
    expect(success).toBe(true);
  });

  it('debe eliminar tarea correctamente', async () => {
    const { result } = renderHook(() => useWorkerDashboard());

    await act(async () => {
      await Promise.resolve();
    });

    let success = false;
    await act(async () => {
      success = await result.current.handleDeleteTask('task-1');
    });

    expect(workshopService.deleteTask).toHaveBeenCalledWith('task-1');
    expect(success).toBe(true);
  });

  it('debe eliminar cita correctamente', async () => {
    const { result } = renderHook(() => useWorkerDashboard());

    await act(async () => {
      await Promise.resolve();
    });

    let success = false;
    await act(async () => {
      success = await result.current.handleDeleteAppointment('app-1');
    });

    expect(workshopService.deleteAppointment).toHaveBeenCalledWith('app-1');
    expect(success).toBe(true);
  });

  it('debe actualizar perfil correctamente', async () => {
    const { result } = renderHook(() => useWorkerDashboard());

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.handleProfileUpdate({ firstname: 'Carlos', lastname: 'Márquez', address: 'Calle Nueva 123' });
    });

    expect(workshopService.updateEmployeeMe).toHaveBeenCalledWith({ firstname: 'Carlos', lastname: 'Márquez', address: 'Calle Nueva 123' });
    expect(result.current.employeeProfile?.firstname).toBe('Carlos');
  });
});
