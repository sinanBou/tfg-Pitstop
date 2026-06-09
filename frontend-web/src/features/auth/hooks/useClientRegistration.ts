import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import type { ClientRegistrationFormData } from '../types/auth.types';
import { useToast } from '@/hooks/useToast';

/**
 * Hook personalizado para controlar el formulario y proceso de registro de nuevos Clientes (Conductores).
 * Envía los datos personales, NIF, teléfono y dirección al backend y redirige al login tras tener éxito.
 */
export function useClientRegistration() {
  const toast = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ClientRegistrationFormData>({
    firstname: '', 
    lastname: '', 
    email: '', 
    password: '',
    confirmPassword: '',
    nif: '', 
    phoneNumber: '', 
    address: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const registerClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.registerClient(formData);
      toast.success('¡Registro exitoso! Por favor, verifica tu correo electrónico antes de iniciar sesión.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Error al registrar el cliente');
    } finally {
      setIsLoading(false);
    }
  };

  return { formData, handleChange, registerClient, isLoading };
}