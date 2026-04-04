export interface UserDTO {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

export interface VehicleDTO {
  id: string;
  brand: string;
  model: string;
  licensePlate: string;
  status: string;
}

export interface AppointmentDTO {
  id: string;
  dateTime: string;      // Viene del Backend (ISO string)
  description: string;   // Viene del Backend
  status: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA';
  vehiclePlate?: string;  // Por compatibilidad
  vehicleDisplay?: string; // Ejemplo: "BMW Serie 3 (1234ABC)"
  workshopName?: string;
  
  // Campos calculados para el Frontend
  date: string; 
  time: string;
  serviceType: string; 
}

export interface HistoryDTO {
  id: string;
  finishDate: string;
  vehicleName: string;
  description: string;
  totalCost: number;
}
export interface VehicleRequest {
  brand: string;
  model: string;
  licensePlate: string;
  vin: string;
  year: number;
  color: string;
}

export interface AppointmentRequest {
  vehicleId: string;
  workshopId: string;
  date: string;
  time: string;
  serviceType: string;
  description: string;
}


export interface WorkshopMinDTO {
  id: string; // Cambiar de number a string para soportar UUID
  companyName: string;
  address?: string;
  workingDays?: string;
}

export interface AvailableSlotDTO {
  time: string;      // Viene como "09:00:00"
  available: boolean;
}

export interface ClientSearchDTO {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  nif: string;
  phoneNumber: string;
}

export interface VehicleSearchDTO {
  id: string;
  brand: string;
  model: string;
  licensePlate: string;
  clientId: string;
}