import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import type { ClientRegistrationFormData } from '../types/auth.types';
import { useToast } from '@/hooks/useToast';

export function useClientRegistration() {
  const toast = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ClientRegistrationFormData>({
    firstname: '', lastname: '', email: '', password: '',
    nif: '', phoneNumber: '', address: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const registerClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.registerClient(formData);
      toast.success('Cliente registrado con éxito');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Error al registrar el cliente');
    } finally {
      setIsLoading(false);
    }
  };

  return { formData, handleChange, registerClient, isLoading };
}