import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import type { ClientRegistrationFormData } from '../types/auth.types';

export function useClientRegistration() {
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
      alert('Cliente registrado con éxito');
      navigate('/login');
    } catch (err: any) {
      alert(err.message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return { formData, handleChange, registerClient, isLoading };
}