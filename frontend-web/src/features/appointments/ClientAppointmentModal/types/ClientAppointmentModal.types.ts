import type { VehicleDTO, AppointmentRequest, WorkshopMinDTO } from '@/types/client';

export interface ClientAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: VehicleDTO[];
  workshops: WorkshopMinDTO[];
  onSubmit: (data: AppointmentRequest) => Promise<boolean>;
  fetchSlots: (workshopId: string, date: string) => Promise<string[]>;
  existingAppointments?: any[];
}
