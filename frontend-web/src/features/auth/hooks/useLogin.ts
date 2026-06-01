import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import type { LoginFormData } from '../types/auth.types';
import { useToast } from '@/hooks/useToast';

export function useLogin() {
  const toast = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[key: string]: string} = {};
    let isValid = true;

    // Validaciones simples
    if (!formData.email) { newErrors.email = 'Email obligatorio'; isValid = false; }
    if (!formData.password) { newErrors.password = 'Contraseña obligatoria'; isValid = false; }

    setErrors(newErrors);

    if (isValid) {
      setIsLoading(true);
      try {
        const data = await authService.login(formData);

        // --- AQUÍ GUARDAMOS TODO ---
        if (data.token) {
          localStorage.setItem('jwt_token', data.token);
          localStorage.setItem('role', data.role); // Guardamos el rol (CLIENT, WORKSHOP_OWNER, etc)
        }

        toast.success('¡Inicio de sesión exitoso!');

        switch (data.role) {
          case 'CLIENT':
            navigate('/client-dashboard');
            break;

          case 'WORKSHOP_OWNER':
            navigate('/owner-dashboard');
            break;

          case 'WORKSHOP_MANAGER':
          case 'WORKSHOP_STAFF':
            navigate('/worker-dashboard');
            break;

          default:
            console.error("Rol no reconocido:", data.role);
            navigate('/login');
            break;
        }
      } catch (err: any) {
        toast.error(err.message || 'Credenciales inválidas o error en el servidor.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async (idToken: string) => {
    setIsLoading(true);
    setErrors({});
    try {
      const data = await authService.loginWithGoogle(idToken);

      if (data.token) {
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('role', data.role);
      }

      toast.success('¡Inicio de sesión con Google exitoso!');

      switch (data.role) {
        case 'CLIENT':
          navigate('/client-dashboard');
          break;

        case 'WORKSHOP_OWNER':
          navigate('/owner-dashboard');
          break;

        case 'WORKSHOP_MANAGER':
        case 'WORKSHOP_STAFF':
          navigate('/worker-dashboard');
          break;

        default:
          console.error("Rol no reconocido:", data.role);
          navigate('/login');
          break;
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al iniciar sesión con Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return { formData, errors, isLoading, handleChange, handleLogin, handleGoogleLogin };
}