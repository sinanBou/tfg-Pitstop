import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import type { OwnerRegistrationFormData } from '../types/auth.types';
import { useToast } from '@/hooks/useToast';

export function useOwnerRegistration() {
  const toast = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<OwnerRegistrationFormData>({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    address: '',
    nif: '',
    phoneNumber: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const registerOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.registerOwner(formData);
      toast.success('Propietario registrado con éxito');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    formData, 
    handleChange, 
    registerOwner, 
    isLoading 
  };
}
