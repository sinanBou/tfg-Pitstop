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
  confirmPassword: string;
  nif: string;
  phoneNumber: string;
  address: string;
}

export interface OwnerRegistrationFormData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  nif: string;
  phoneNumber: string;
  address: string;
}


