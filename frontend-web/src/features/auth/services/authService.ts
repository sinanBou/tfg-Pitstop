import { API_BASE_URL } from '@/config/api';
import type { 
  LoginFormData, 
  LoginResponse, 
  ClientRegistrationFormData, 
  OwnerRegistrationFormData 
} from '../types/auth.types';

/**
 * Procesa y limpia los errores devueltos por el servidor, eliminando prefijos de estado HTTP
 * (ej: "403 FORBIDDEN \"Mensaje de error\"") para mostrar únicamente el texto limpio al usuario.
 */
const handleResponseError = async (res: Response, defaultMessage: string): Promise<never> => {
  const errorText = await res.text();
  if (!errorText) {
    throw new Error(defaultMessage);
  }

  let finalMessage = errorText;

  // Intentamos parsear por si es un JSON de error de Spring Security
  try {
    const parsed = JSON.parse(errorText);
    if (parsed && typeof parsed === 'object') {
      finalMessage = parsed.message || parsed.error || defaultMessage;
    }
  } catch {
    // Si no es un JSON, mantenemos el texto plano de error
  }

  // Regex para limpiar prefijos como "401 UNAUTHORIZED " o "403 FORBIDDEN " y extraer el texto de las comillas
  const cleanMatch = finalMessage.match(/^\d+\s+[A-Z_]+\s+["']?(.*?)["']?$/);
  if (cleanMatch) {
    finalMessage = cleanMatch[1];
  }

  throw new Error(finalMessage);
};

export const login = async (formData: LoginFormData): Promise<LoginResponse> => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.email.trim().toLowerCase(),
      password: formData.password
    })
  });

  if (!res.ok) {
    await handleResponseError(res, 'Credenciales inválidas o cuenta no verificada.');
  }
  return res.json();
};

export const loginWithGoogle = async (idToken: string): Promise<LoginResponse> => {
  const res = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  });

  if (!res.ok) {
    await handleResponseError(res, 'Error al iniciar sesión con Google.');
  }
  return res.json();
};

export const registerClient = async (formData: ClientRegistrationFormData): Promise<void> => {
  // Excluir confirmPassword del envío al backend
  const { confirmPassword, ...payload } = formData;

  const res = await fetch(`${API_BASE_URL}/auth/register/client`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    await handleResponseError(res, 'Error al registrar cliente');
  }
};

export const registerOwner = async (formData: OwnerRegistrationFormData): Promise<void> => {
  // Excluir confirmPassword del envío al backend
  const { confirmPassword, ...payload } = formData;

  const res = await fetch(`${API_BASE_URL}/auth/register/workshop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    await handleResponseError(res, 'Error al registrar propietario');
  }
};

export const verifyAccount = async (token: string): Promise<string> => {
  const res = await fetch(`${API_BASE_URL}/auth/verify?token=${encodeURIComponent(token)}`, {
    method: 'GET'
  });

  if (!res.ok) {
    await handleResponseError(res, 'Token de verificación no válido o expirado.');
  }
  return res.text();
};

export const forgotPassword = async (email: string): Promise<string> => {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  if (!res.ok) {
    await handleResponseError(res, 'Error al solicitar recuperación de contraseña.');
  }
  return res.text();
};

export const resetPassword = async (token: string, newPassword: string): Promise<string> => {
  const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });

  if (!res.ok) {
    await handleResponseError(res, 'Error al restablecer la contraseña.');
  }
  return res.text();
};
