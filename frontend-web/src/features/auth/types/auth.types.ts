export interface LoginFormData {
  email: string;
  password: string;
  [key: string]: string;
}

export interface LoginResponse {
  token?: string;
  role: 'CLIENT' | 'WORKSHOP_STAFF' | 'WORKSHOP_MANAGER' | 'WORKSHOP_OWNER';
}

export interface ClientRegistrationFormData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  nif: string;
  phoneNumber: string;
  address: string;
}

export interface WorkshopRegistrationFormData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  address: string;
  nif: string;
  phoneNumber: string;
}
