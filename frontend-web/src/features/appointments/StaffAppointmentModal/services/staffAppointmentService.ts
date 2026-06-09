import { API_BASE_URL } from '@/config/api';
import type { VehicleRequest } from '@/features/client';

/**
 * Obtiene las cabeceras HTTP necesarias para las peticiones autenticadas y con JSON payload.
 * @returns Cabeceras con la autorización Bearer JWT y Content-Type.
 */
const getHeaders = () => {
  const token = localStorage.getItem('jwt_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Obtiene los detalles de configuración operativa de un taller específico (ej: horarios, tarifas).
 * @param workshopId ID del taller.
 * @returns Promesa con los ajustes del taller.
 */
export const fetchWorkshopSettings = async (workshopId: string) => {
  const res = await fetch(`${API_BASE_URL}/workshops/${workshopId}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
  });
  if (!res.ok) throw new Error('Error al obtener ajustes del taller');
  return res.json();
};

/**
 * Obtiene el listado completo de mecánicos y empleados registrados en un taller.
 * @param workshopId ID del taller.
 * @returns Promesa con la colección de empleados.
 */
export const fetchEmployees = async (workshopId: string) => {
  const res = await fetch(`${API_BASE_URL}/employees/workshop/${workshopId}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
  });
  if (!res.ok) throw new Error('Error al obtener mecánicos');
  return res.json();
};

/**
 * Obtiene el listado de marcas de vehículos disponibles en el catálogo global.
 * @returns Promesa con la lista de marcas.
 */
export const fetchCatalogMakes = async () => {
  const res = await fetch(`${API_BASE_URL}/vehicles/catalog/makes`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
  });
  if (!res.ok) throw new Error('Error al obtener marcas de catálogo');
  return res.json();
};

/**
 * Obtiene los modelos de vehículos en el catálogo filtrando por una marca específica.
 * @param make Nombre de la marca.
 * @returns Promesa con el listado de modelos.
 */
export const fetchCatalogModels = async (make: string) => {
  const res = await fetch(`${API_BASE_URL}/vehicles/catalog/models/${make}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
  });
  if (!res.ok) throw new Error('Error al obtener modelos de catálogo');
  return res.json();
};

/**
 * Realiza una búsqueda paginada de clientes del taller a partir de un término de búsqueda (nombre, email, NIF).
 * @param query Término o patrón de búsqueda.
 * @param page Índice de página.
 * @param size Tamaño de página.
 * @returns Promesa con la página de resultados de clientes.
 */
export const searchClients = async (query: string, page: number, size: number = 5) => {
  const res = await fetch(`${API_BASE_URL}/clients/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
  });
  if (!res.ok) throw new Error('Error al buscar clientes');
  return res.json();
};

/**
 * Busca un vehículo registrado en el sistema a partir de su matrícula exacta.
 * @param licensePlate Matrícula a consultar.
 * @returns Promesa con los datos del vehículo.
 */
export const searchVehiclesByPlate = async (licensePlate: string) => {
  const res = await fetch(`${API_BASE_URL}/vehicles/search?licensePlate=${licensePlate}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
  });
  if (!res.ok) throw new Error('Error al buscar vehículo por matrícula');
  return res.json();
};

/**
 * Obtiene el listado de todos los vehículos registrados y asociados a un cliente específico.
 * @param clientId ID del cliente.
 * @returns Promesa con el listado de vehículos.
 */
export const fetchClientVehicles = async (clientId: string) => {
  const res = await fetch(`${API_BASE_URL}/vehicles/client/${clientId}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
  });
  if (!res.ok) throw new Error('Error al obtener vehículos del cliente');
  return res.json();
};

/**
 * Registra de forma manual a un cliente en el sistema sin requerir que cree una cuenta de usuario inicial.
 * @param clientForm Datos del formulario del cliente (nombre, email, NIF, teléfono).
 * @returns Promesa con los datos del cliente registrado.
 */
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

/**
 * Registra y asocia un vehículo nuevo a la ficha de un cliente determinado.
 * @param clientId ID del cliente propietario.
 * @param vehicleForm Datos del vehículo (marca, modelo, matrícula, año, etc.).
 * @returns Promesa con los datos del vehículo registrado.
 */
export const registerVehicleForClient = async (clientId: string, vehicleForm: VehicleRequest) => {
  const res = await fetch(`${API_BASE_URL}/vehicles/register-for-client/${clientId}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(vehicleForm)
  });
  if (!res.ok) throw new Error('Error al registrar vehículo');
  return res.json();
};

/**
 * Obtiene los slots de horarios disponibles (libres de colisiones de mecánicos o capacidad)
 * para una fecha determinada en el taller.
 * @param workshopId ID del taller.
 * @param date Fecha a consultar (en formato YYYY-MM-DD).
 * @returns Promesa con el listado de slots horarios disponibles.
 */
export const fetchAvailabilitySlots = async (workshopId: string, date: string) => {
  const res = await fetch(`${API_BASE_URL}/appointments/availability/${workshopId}?date=${date}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
  });
  if (!res.ok) throw new Error('Error al obtener slots de disponibilidad');
  return res.json();
};

/**
 * Estructura de la petición para crear una cita presencial/de personal.
 */
export interface CreateStaffAppointmentRequest {
  /** ID del taller donde se realiza la cita. */
  workshopId: string;
  /** ID del vehículo del cliente. */
  vehicleId: string;
  /** Fecha y hora de la cita en formato ISO. */
  dateTime: string;
  /** Cadena de códigos de servicios a realizar concatenados por comas. */
  serviceType: string;
  /** Descripción o notas adicionales sobre la reparación. */
  description: string;
  /** Duración total estimada en minutos del trabajo. */
  estimatedDuration: number;
  /** ID del mecánico asignado inicialmente, o null si está pendiente de asignación. */
  assignedEmployeeId: string | null;
}

/**
 * Crea una nueva cita presencial o de personal (Staff Appointment) en el taller.
 * @param req Datos de la cita a crear.
 * @returns Promesa que se resuelve con true si la cita se creó correctamente.
 */
export const createStaffAppointment = async (req: CreateStaffAppointmentRequest) => {
  const res = await fetch(`${API_BASE_URL}/appointments/staff`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(req)
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(errorText || 'Error al crear la cita presencial');
  }
  return res.ok;
};

