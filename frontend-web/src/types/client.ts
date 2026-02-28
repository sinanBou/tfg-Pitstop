export interface UserDTO {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

export interface VehicleDTO {
  id: number;
  brand: string;
  model: string;
  licensePlate: string;
  status: string;
}

export interface AppointmentDTO {
  id: string;
  date: string;
  time: string;
  serviceType: string;
  status: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA';
  vehiclePlate: string;
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
  vehicleId: number;
  workshopId: number;
  date: string;
  time: string;
  serviceType: string;
  description: string;
}


export interface WorkshopMinDTO {
  id: number;
  workshopName: string;
}