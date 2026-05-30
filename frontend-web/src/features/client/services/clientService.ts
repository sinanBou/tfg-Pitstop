import { API_BASE_URL } from '@/config/api';
import type { 
  UserDTO, 
  VehicleDTO, 
  AppointmentDTO, 
  WorkshopMinDTO, 
  AvailableSlotDTO 
} from '../types/client.types';

// Helper local para las cabeceras de autenticación JWT
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('jwt_token');
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
};

export const getUserProfile = async (): Promise<UserDTO> => {
  const res = await fetchWithAuth('/users/me');
  if (!res.ok) throw new Error('Error al obtener perfil de usuario');
  return res.json();
};

export const getClientProfile = async (): Promise<any> => {
  const res = await fetchWithAuth('/clients/me');
  if (!res.ok) throw new Error('Error al obtener perfil de cliente');
  return res.json();
};

export const getMyVehicles = async (): Promise<VehicleDTO[]> => {
  const res = await fetchWithAuth('/vehicles/my-vehicles');
  if (!res.ok) throw new Error('Error al obtener vehículos');
  return res.json();
};

export const getWorkshops = async (): Promise<WorkshopMinDTO[]> => {
  const res = await fetchWithAuth('/workshops');
  if (!res.ok) throw new Error('Error al obtener talleres');
  return res.json();
};

export const getMyAppointments = async (): Promise<AppointmentDTO[]> => {
  const res = await fetchWithAuth('/appointments/my-appointments');
  if (!res.ok) throw new Error('Error al obtener citas');
  return res.json();
};

export const registerVehicle = async (vehicleData: any): Promise<boolean> => {
  const res = await fetchWithAuth('/vehicles/register', {
    method: 'POST',
    body: JSON.stringify(vehicleData)
  });
  return res.ok;
};

export const createAppointment = async (appointmentData: any): Promise<boolean> => {
  const payload = {
    ...appointmentData,
    dateTime: `${appointmentData.date}T${appointmentData.time}:00` 
  };
  const res = await fetchWithAuth('/appointments', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res.ok;
};

export const getAvailableSlots = async (workshopId: string, date: string): Promise<string[]> => {
  if (!workshopId || !date) return [];
  const res = await fetchWithAuth(`/appointments/availability/${workshopId}?date=${date}`);
  if (res.ok) {
    const data: AvailableSlotDTO[] = await res.json();
    return data
      .filter(slot => slot.available)
      .map(slot => slot.time.substring(0, 5));
  }
  return [];
};

export const deleteAppointment = async (appointmentId: string): Promise<boolean> => {
  const res = await fetchWithAuth(`/appointments/${appointmentId}`, {
    method: 'DELETE'
  });
  return res.ok;
};

export const deleteVehicle = async (vehicleId: string): Promise<boolean> => {
  const res = await fetchWithAuth(`/vehicles/${vehicleId}`, {
    method: 'DELETE'
  });
  return res.ok;
};

export const getCatalogMakes = async (): Promise<string[]> => {
  const res = await fetchWithAuth('/vehicles/catalog/makes');
  if (res.ok) return res.json();
  return [];
};

export const getCatalogModels = async (make: string): Promise<string[]> => {
  if (!make) return [];
  const res = await fetchWithAuth(`/vehicles/catalog/models/${make}`);
  if (res.ok) return res.json();
  return [];
};

export const updateProfile = async (profileData: any): Promise<any> => {
  const res = await fetchWithAuth('/clients/me', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
  if (!res.ok) throw new Error('Error al actualizar perfil');
  return res.json();
};
