export interface PartItem {
  name: string;
  price: number;
}

export interface InvoiceData {
  id: string;
  laborRate: number;
  totalLabor: number;
  partsJson: string;
  totalParts: number;
  totalPrice: number;
  createdAt: string;
  clientFullName: string;
  vehicleDisplay: string;
  serviceType?: string;
  description: string;
}

export interface Invoice {
  id: string;
  appointmentId: string;
  workshopId: string;
  laborRate: number;
  totalLabor: number;
  partsJson: string;
  totalParts: number;
  totalPrice: number;
  createdAt: string;
  clientFullName: string;
  vehicleDisplay: string;
  serviceType: string;
  description: string;
}
