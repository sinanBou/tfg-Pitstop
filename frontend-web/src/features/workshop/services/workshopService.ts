import { API_BASE_URL } from '@/config/api';
import type {
  EmployeeProfile,
  Workshop,
  WorkshopSettingsPayload,
  EmployeeRegistrationPayload,
  WorkshopCreationPayload,
  UpdateProfilePayload
} from '../types/workshop.types';

const getAuthHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('jwt_token');
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`
  };
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export const getEmployeeMe = async (): Promise<EmployeeProfile> => {
  const res = await fetch(`${API_BASE_URL}/employees/me`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error al obtener perfil del empleado');
  return res.json();
};

export const getUserMe = async (): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error al obtener usuario actual');
  return res.json();
};

export const getWorkshopsByOwner = async (ownerId: string): Promise<Workshop[]> => {
  const res = await fetch(`${API_BASE_URL}/workshops/owner/${ownerId}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error al obtener talleres por propietario');
  return res.json();
};

export const updateEmployeeMe = async (payload: UpdateProfilePayload): Promise<EmployeeProfile> => {
  const res = await fetch(`${API_BASE_URL}/employees/me`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Error al actualizar perfil del empleado');
  return res.json();
};

export const uploadAvatar = async (file: File): Promise<EmployeeProfile> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/employees/me/avatar`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: formData
  });
  if (!res.ok) throw new Error('Error al subir avatar');
  return res.json();
};

export const deleteAvatar = async (): Promise<EmployeeProfile> => {
  const res = await fetch(`${API_BASE_URL}/employees/me/avatar`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error al eliminar avatar');
  return res.json();
};

export const getAppointmentsByWorkshop = async (workshopId: string): Promise<any[]> => {
  const res = await fetch(`${API_BASE_URL}/appointments/workshop/${workshopId}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error al obtener citas del taller');
  return res.json();
};

export const getTasksByWorkshopAndDate = async (workshopId: string, dateIso: string): Promise<any[]> => {
  const res = await fetch(`${API_BASE_URL}/workshop-tasks/workshop/${workshopId}?date=${dateIso}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error al obtener tareas del taller');
  return res.json();
};

/** Fetches all DELAYED workshop tasks for the given workshop, regardless of date. */
export const getDelayedTasksByWorkshop = async (workshopId: string): Promise<any[]> => {
  const res = await fetch(`${API_BASE_URL}/workshop-tasks/workshop/${workshopId}/delayed`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error al obtener tareas retrasadas del taller');
  return res.json();
};

export const getEmployeesByWorkshop = async (workshopId: string): Promise<EmployeeProfile[]> => {
  const res = await fetch(`${API_BASE_URL}/employees/workshop/${workshopId}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error al obtener empleados del taller');
  return res.json();
};

export const getWorkshopById = async (workshopId: string): Promise<Workshop> => {
  const res = await fetch(`${API_BASE_URL}/workshops/${workshopId}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error al obtener información del taller');
  return res.json();
};

export const getAppointmentsReadyForCompletion = async (workshopId: string): Promise<any[]> => {
  const res = await fetch(`${API_BASE_URL}/appointments/workshop/${workshopId}/ready-for-completion`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error al obtener citas listas para completar');
  return res.json();
};

export const assignAppointment = async (appointmentId: string, employeeId: string | null): Promise<void> => {
  const url = `${API_BASE_URL}/appointments/${appointmentId}/assign` + (employeeId ? `?employeeId=${employeeId}` : '');
  const res = await fetch(url, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Error al asignar la cita');
  }
};

export const rescheduleAppointment = async (
  appointmentId: string,
  employeeId: string | null,
  dateTimeIso: string,
  duration?: number
): Promise<void> => {
  const url = `${API_BASE_URL}/appointments/${appointmentId}/reschedule?dateTime=${dateTimeIso}` +
              (employeeId ? `&employeeId=${employeeId}` : '') +
              (duration ? `&duration=${duration}` : '');
  const res = await fetch(url, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Error al reubicar cita');
  }
};

export const updateAppointmentStatus = async (appointmentId: string, status: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/status?status=${status}`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error al actualizar estado de la cita');
};

export const updateTaskStatus = async (taskId: string, status: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/workshop-tasks/${taskId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Error al actualizar estado de la tarea');
};

export const rescheduleTask = async (
  taskId: string,
  payload: { dateTime: string; assignedEmployeeId: string | null; estimatedDuration?: number; reassignEmployee: boolean }
): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/workshop-tasks/${taskId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Error al reubicar tarea');
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/workshop-tasks/${taskId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error al eliminar tarea');
};

export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error al eliminar cita');
};

export const checkInVehicle = async (appointmentId: string, kilometers: number, notes: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/check-in?kilometers=${kilometers}&notes=${encodeURIComponent(notes)}`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error al recepcionar vehículo');
};

export const updateWorkshopSettings = async (workshopId: string, payload: WorkshopSettingsPayload): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/workshops/${workshopId}/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Error al guardar ajustes');
  }
};

export const registerEmployee = async (workshopId: string, payload: EmployeeRegistrationPayload): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/employees/register/${workshopId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Error al registrar empleado');
  }
};

export const deleteEmployee = async (employeeId: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error al eliminar empleado');
};

export const promoteEmployee = async (employeeId: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/employees/${employeeId}/promote`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Error al ascender empleado');
  }
};

export const demoteEmployee = async (employeeId: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/employees/${employeeId}/demote`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Error al degradar empleado');
  }
};

export const uploadWorkshopLogo = async (workshopId: string, file: File): Promise<Workshop> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/workshops/${workshopId}/logo`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: formData
  });
  if (!res.ok) throw new Error('Error al subir logo del taller');
  return res.json();
};

export const deleteWorkshopLogo = async (workshopId: string): Promise<Workshop> => {
  const res = await fetch(`${API_BASE_URL}/workshops/${workshopId}/logo`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error al eliminar logo del taller');
  return res.json();
};

export const createWorkshop = async (payload: WorkshopCreationPayload): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/workshops`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Error al crear taller');
  }
};

export const deleteWorkshop = async (workshopId: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/workshops/${workshopId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Error al eliminar el taller');
  }
};
