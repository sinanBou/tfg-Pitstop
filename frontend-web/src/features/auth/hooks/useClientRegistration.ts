import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/utils/errorUtils';

export function useClientRegistration() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '', 
    lastname: '', 
    email: '', 
    password: '',
    confirmPassword: '', // Nuevo campo para doble verificación
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
      // Excluir confirmPassword antes de enviar al backend
      const { confirmPassword, ...payload } = formData;

      const response = await fetch('http://localhost:9091/api/auth/register/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showToast('¡Registro exitoso! Por favor, verifica tu correo electrónico antes de iniciar sesión.', 'success');
        navigate('/login');
      } else {
        const errorMsg = await getErrorMessage(response);
        showToast(errorMsg, 'error');
      }
    } catch {
      showToast('Error de conexión con el servidor.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return { formData, setFormData, handleChange, registerClient, isLoading };
}