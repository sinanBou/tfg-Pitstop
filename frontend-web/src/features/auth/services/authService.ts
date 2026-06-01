import { API_BASE_URL } from '@/config/api';
import type { 
  LoginFormData, 
  LoginResponse, 
  ClientRegistrationFormData, 
  OwnerRegistrationFormData 
} from '../types/auth.types';

export const login = async (formData: LoginFormData): Promise<LoginResponse> => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });

  if (!res.ok) {
    throw new Error('Credenciales inválidas o error en el servidor.');
  }
  return res.json();
};

export const registerClient = async (formData: ClientRegistrationFormData): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/auth/register/client`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Error al registrar cliente');
  }
};

export const registerOwner = async (formData: OwnerRegistrationFormData): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/auth/register/owner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Error al registrar propietario');
  }
};
