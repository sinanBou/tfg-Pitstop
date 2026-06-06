export interface EmployeeProfile {
  id?: string;
  employeeId?: string;
  firstname: string;
  lastname: string;
  email?: string;
  role?: string;
  address: string;
  nif?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  profilePictureUrl?: string;
  allowedSections?: string;
  workshopId?: string;
}

export interface Workshop {
  id: string;
  cif: string;
  companyName: string;
  address: string;
  workingDays: string;
  openTime: string;
  closeTime: string;
  slotDurationMinutes: number;
  hourlyRate?: number;
  includeOwnerInPlanning?: boolean;
  logoUrl?: string;
  logoPictureUrl?: string;
  ownerId?: string | null;
}

export interface WorkshopSettingsPayload {
  openTime: string;
  closeTime: string;
  slotDurationMinutes: number;
  workingDays: string;
  hourlyRate: number;
  includeOwnerInPlanning: boolean;
}

export interface EmployeeRegistrationPayload {
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  role: string;
  address: string;
}

export interface WorkshopCreationPayload {
  cif: string;
  companyName: string;
  address: string;
  workingDays: string;
  openTime: string;
  closeTime: string;
  slotDurationMinutes: number;
  ownerId: string | null;
}

export interface UpdateProfilePayload {
  firstname: string;
  lastname: string;
  address: string;
  nif?: string;
  phoneNumber?: string;
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
