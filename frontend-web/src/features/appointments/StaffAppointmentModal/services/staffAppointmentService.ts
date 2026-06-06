import { API_BASE_URL } from '@/config/api';
import type { VehicleRequest } from '@/features/client';

const getHeaders = () => {
  const token = localStorage.getItem('jwt_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const fetchWorkshopSettings = async (workshopId: string) => {
  const res = await fetch(`${API_BASE_URL}/workshops/${workshopId}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
  });
  if (!res.ok) throw new Error('Error al obtener ajustes del taller');
  return res.json();
};

export const fetchEmployees = async (workshopId: string) => {
  const res = await fetch(`${API_BASE_URL}/employees/workshop/${workshopId}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
  });
  if (!res.ok) throw new Error('Error al obtener mecánicos');
  return res.json();
};

export const fetchCatalogMakes = async () => {
  const res = await fetch(`${API_BASE_URL}/vehicles/catalog/makes`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
  });
  if (!res.ok) throw new Error('Error al obtener marcas de catálogo');
  return res.json();
};

export const fetchCatalogModels = async (make: string) => {
  const res = await fetch(`${API_BASE_URL}/vehicles/catalog/models/${make}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
  });
  if (!res.ok) throw new Error('Error al obtener modelos de catálogo');
  return res.json();
};

export const searchClients = async (query: string, page: number, size: number = 5) => {
  const res = await fetch(`${API_BASE_URL}/clients/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
  });
  if (!res.ok) throw new Error('Error al buscar clientes');
  return res.json();
};

export const searchVehiclesByPlate = async (licensePlate: string) => {
  const res = await fetch(`${API_BASE_URL}/vehicles/search?licensePlate=${licensePlate}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
  });
  if (!res.ok) throw new Error('Error al buscar vehículo por matrícula');
  return res.json();
};

export const fetchClientVehicles = async (clientId: string) => {
  const res = await fetch(`${API_BASE_URL}/vehicles/client/${clientId}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
  });
  if (!res.ok) throw new Error('Error al obtener vehículos del cliente');
  return res.json();
};

export const manualRegisterClient = async (clientForm: any) => {
  const res = await fetch(`${API_BASE_URL}/clients/manual-register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(clientForm)
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Error al registrar cliente');
  }
  return res.json();
};

export const registerVehicleForClient = async (clientId: string, vehicleForm: VehicleRequest) => {
  const res = await fetch(`${API_BASE_URL}/vehicles/register-for-client/${clientId}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(vehicleForm)
  });
  if (!res.ok) throw new Error('Error al registrar vehículo');
  return res.json();
};

export const fetchAvailabilitySlots = async (workshopId: string, date: string) => {
  const res = await fetch(`${API_BASE_URL}/appointments/availability/${workshopId}?date=${date}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
  });
  if (!res.ok) throw new Error('Error al obtener slots de disponibilidad');
  return res.json();
};

export interface CreateStaffAppointmentRequest {
  workshopId: string;
  vehicleId: string;
  dateTime: string;
  serviceType: string;
  description: string;
  estimatedDuration: number;
  assignedEmployeeId: string | null;
}

export const createStaffAppointment = async (req: CreateStaffAppointmentRequest) => {
  const res = await fetch(`${API_BASE_URL}/appointments/staff`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(req)
  });
  if (!res.ok) throw new Error('Error al crear la cita presencial');
  return res.ok;
};
