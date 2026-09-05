import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { EmployeeProfile, Workshop } from '../types/workshop.types';

const { mockNavigate, mockToast } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockToast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn()
  }
}));

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'ws-1' }),
  useNavigate: () => mockNavigate
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => mockToast
}));

const mockEmployeeMe: EmployeeProfile = {
  id: 'emp-admin',
  firstname: 'Juan',
  lastname: 'Admin',
  address: 'Calle Admin 123',
  workshopId: 'ws-1'
};

const mockWorkshop: Workshop = {
  id: 'ws-1',
  companyName: 'Talleres Central',
  cif: 'B98765432',
  address: 'Calle Principal 10',
  workingDays: 'LUNES, MARTES, MIERCOLES, JUEVES, VIERNES',
  openTime: '08:30',
  closeTime: '17:30',
  slotDurationMinutes: 30,
  hourlyRate: 60.0,
  includeOwnerInPlanning: true,
  logoUrl: 'http://logo.url'
};

const mockAppointments = [
  { id: 'app-admin-1', dateTime: '2026-06-01T10:00:00', status: 'CONFIRMED', assignedEmployeeId: 'emp-admin' }
];

const mockTasks = [
  { id: 'task-admin-1', dateTime: '2026-06-01T10:30:00', status: 'PENDING', assignedEmployeeId: null }
];

const mockEmployees: EmployeeProfile[] = [
  mockEmployeeMe,
  { id: 'emp-staff-1', firstname: 'Luis', lastname: 'Mecánico', address: 'Calle Mecánico 12', workshopId: 'ws-1' }
];

let dynamicWorkshop = { ...mockWorkshop };
let dynamicEmployee = { ...mockEmployeeMe };

vi.mock('../services/workshopService', () => ({
  getWorkshopById: vi.fn(() => Promise.resolve(dynamicWorkshop)),
  getEmployeeMe: vi.fn(() => Promise.resolve(dynamicEmployee)),
  getAppointmentsByWorkshop: vi.fn(() => Promise.resolve(mockAppointments)),
  getTasksByWorkshopAndDate: vi.fn(() => Promise.resolve(mockTasks)),
  getEmployeesByWorkshop: vi.fn(() => Promise.resolve(mockEmployees)),
  getAppointmentsReadyForCompletion: vi.fn(() => Promise.resolve([])),
  getDelayedTasksByWorkshop: vi.fn(() => Promise.resolve([])),
  updateWorkshopSettings: vi.fn(() => Promise.resolve()),
  registerEmployee: vi.fn(() => Promise.resolve()),
  deleteEmployee: vi.fn(() => Promise.resolve()),
  promoteEmployee: vi.fn(() => Promise.resolve()),
  demoteEmployee: vi.fn(() => Promise.resolve()),
  assignAppointment: vi.fn(() => Promise.resolve()),
  rescheduleAppointment: vi.fn(() => Promise.resolve()),
  deleteAppointment: vi.fn(() => Promise.resolve()),
  updateAppointmentStatus: vi.fn(() => Promise.resolve()),
  updateTaskStatus: vi.fn(() => Promise.resolve()),
  rescheduleTask: vi.fn(() => Promise.resolve()),
  deleteTask: vi.fn(() => Promise.resolve()),
  checkInVehicle: vi.fn(() => Promise.resolve()),
  updateEmployeeMe: vi.fn((data) => {
    dynamicEmployee = { ...dynamicEmployee, ...data };
    return Promise.resolve(dynamicEmployee);
  }),
  uploadAvatar: vi.fn(() => Promise.resolve(dynamicEmployee)),
  deleteAvatar: vi.fn(() => Promise.resolve(dynamicEmployee)),
  uploadWorkshopLogo: vi.fn(() => {
    dynamicWorkshop = { ...dynamicWorkshop, logoUrl: 'http://new-logo.url' };
    return Promise.resolve(dynamicWorkshop);
  }),
  deleteWorkshopLogo: vi.fn(() => {
    dynamicWorkshop = { ...dynamicWorkshop, logoUrl: undefined };
    return Promise.resolve(dynamicWorkshop);
  })
}));

import { useWorkshopAdmin } from './useWorkshopAdmin';
import * as workshopService from '../services/workshopService';

const alertSpy = vi.fn();

describe('useWorkshopAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dynamicWorkshop = { ...mockWorkshop };
    dynamicEmployee = { ...mockEmployeeMe };
    alertSpy.mockClear();
    mockToast.success.mockClear();
    mockToast.error.mockClear();
    vi.stubGlobal('alert', alertSpy);
    vi.stubGlobal('confirm', () => true);

    const localStorageMock = {
      getItem: vi.fn((key) => {
        if (key === 'role') return 'WORKSHOP_OWNER';
        return 'mock-token';
      }),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn()
    };
    vi.stubGlobal('localStorage', localStorageMock);
  });

  it('debe denegar acceso si el rol no es OWNER o MANAGER', async () => {
    vi.spyOn(localStorage, 'getItem').mockImplementation((key) => {
      if (key === 'role') return 'CLIENT';
      return 'mock-token';
    });

    renderHook(() => useWorkshopAdmin());

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockToast.error).toHaveBeenCalledWith('Acceso denegado');
    expect(mockNavigate).toHaveBeenCalledWith('/client-dashboard');
  });

  it('debe cargar los datos correctamente cuando tiene permisos', async () => {
    const { result } = renderHook(() => useWorkshopAdmin());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(workshopService.getWorkshopById).toHaveBeenCalledWith('ws-1');
    expect(workshopService.getEmployeeMe).toHaveBeenCalled();
    expect(workshopService.getAppointmentsByWorkshop).toHaveBeenCalledWith('ws-1');
    expect(workshopService.getEmployeesByWorkshop).toHaveBeenCalledWith('ws-1');

    expect(result.current.loading).toBe(false);
    expect(result.current.workshopData).toEqual(mockWorkshop);
    expect(result.current.settingsForm.openTime).toBe('08:30');
    expect(result.current.settingsForm.hourlyRate).toBe('60');
  });

  it('debe guardar los ajustes del taller correctamente', async () => {
    const { result } = renderHook(() => useWorkshopAdmin());

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      result.current.setSettingsForm((prev) => ({ ...prev, hourlyRate: '75.0', openTime: '08:00' }));
    });

    await act(async () => {
      await result.current.handleSettingsSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(workshopService.updateWorkshopSettings).toHaveBeenCalledWith('ws-1', {
      openTime: '08:00',
      closeTime: '17:30',
      slotDurationMinutes: 30,
      workingDays: 'LUNES, MARTES, MIERCOLES, JUEVES, VIERNES',
      hourlyRate: 75.0,
      includeOwnerInPlanning: true
    });
    expect(mockToast.success).toHaveBeenCalledWith('Ajustes actualizados correctamente');
  });

  it('debe registrar un empleado correctamente', async () => {
    const { result } = renderHook(() => useWorkshopAdmin());

    await act(async () => {
      await Promise.resolve();
    });

    const empForm = {
      firstname: 'Carlos',
      lastname: 'Sanz',
      email: 'carlos@example.com',
      password: 'password123',
      role: 'WORKSHOP_STAFF',
      address: 'Calle Falsa 123'
    };

    await act(async () => {
      result.current.setEmployeeForm(empForm);
    });

    await act(async () => {
      await result.current.handleEmployeeSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(workshopService.registerEmployee).toHaveBeenCalledWith('ws-1', empForm);
    expect(mockToast.success).toHaveBeenCalledWith('Empleado registrado con éxito');
  });

  it('debe eliminar empleado al confirmar', async () => {
    const { result } = renderHook(() => useWorkshopAdmin());

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.handleDeleteEmployee('emp-staff-1');
    });

    expect(workshopService.deleteEmployee).toHaveBeenCalledWith('emp-staff-1');
    expect(mockToast.success).toHaveBeenCalledWith('Empleado eliminado');
  });

  it('debe promover y degradar empleado correctamente', async () => {
    const { result } = renderHook(() => useWorkshopAdmin());

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.handlePromoteEmployee('emp-staff-1');
    });
    expect(workshopService.promoteEmployee).toHaveBeenCalledWith('emp-staff-1');

    await act(async () => {
      await result.current.handleDemoteEmployee('emp-staff-1');
    });
    expect(workshopService.demoteEmployee).toHaveBeenCalledWith('emp-staff-1');
  });

  it('debe subir y eliminar logo del taller', async () => {
    const { result } = renderHook(() => useWorkshopAdmin());

    await act(async () => {
      await Promise.resolve();
    });

    const mockFile = new File([''], 'logo.png', { type: 'image/png' });
    let successLogo = false;
    await act(async () => {
      successLogo = await result.current.handleUploadWorkshopLogo(mockFile);
    });
    expect(workshopService.uploadWorkshopLogo).toHaveBeenCalledWith('ws-1', mockFile);
    expect(successLogo).toBe(true);
    expect(result.current.workshopData?.logoUrl).toBe('http://new-logo.url');

    let successDelete = false;
    await act(async () => {
      successDelete = await result.current.handleDeleteWorkshopLogo();
    });
    expect(workshopService.deleteWorkshopLogo).toHaveBeenCalledWith('ws-1');
    expect(successDelete).toBe(true);
    expect(result.current.workshopData?.logoUrl).toBeUndefined();
  });
});
