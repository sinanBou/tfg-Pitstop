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
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'IN_PROGRESS';
  vehiclePlate?: string;  // Por compatibilidad
  vehicleDisplay?: string; // Ejemplo: "BMW Serie 3 (1234ABC)"
  workshopName?: string;
  workshopId?: string;
  
  // Campos calculados para el Frontend
  date: string; 
  time: string;
  serviceType: string; 
  workshopHourlyRate?: number;
  mechanicComments?: string;
  estimatedDuration?: number;
  totalPrice?: number;
  actualStartTime?: string;
  actualEndTime?: string;
  confirmedAt?: string;
  parts?: AppointmentPartDTO[];
}

export interface HistoryDTO {
  id: string;
  finishDate: string;
  vehicleName: string;
  description: string;
  totalCost: number;
  dateTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  confirmedAt?: string;
  parts?: AppointmentPartDTO[];
  workshopId?: string;
  serviceType?: string;
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
  id: string; 
  companyName: string;
  cif?: string;
  address?: string;
  workingDays?: string;
  logoPictureUrl?: string;
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

export interface AppointmentPartDTO {
  id: string;
  partId: string;
  name: string;
  quantityUsed: number;
  appliedPrice: number;
}

export interface PartCategory {
  id: string;
  name: string;
  displayName: string;
}

export interface PartCatalog {
  id: string;
  oemReference: string;
  name: string;
  manufacturer: string;
  technicalSpecs?: string;
  category: PartCategory;
}

export interface WorkshopInventory {
  id: string;
  part: PartCatalog;
  stockQuantity: number;
  costPrice: number;
  retailPrice: number;
  avisoThreshold: number;
}