import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import type { WorkshopRegistrationFormData } from '../types/auth.types';
import { useToast } from '@/hooks/useToast';

export function useWorkshopRegistration() {
  const toast = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<WorkshopRegistrationFormData>({
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

  const registerWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.registerWorkshop(formData);
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
    registerWorkshop, 
    isLoading 
  };
}