import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/utils/errorUtils';

export function useWorkshopRegistration() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Estado inicial completo para el Dueño del Taller y su negocio
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    phoneNumber: '', // Teléfono del dueño
    companyName: '',  // Nombre del taller
    cif: '',          // CIF del taller
    address: '',      // Dirección del taller
    email: '',
    password: '',
    confirmPassword: '', // Doble verificación de contraseña
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const registerWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Excluir confirmPassword antes de enviar al backend
      const { confirmPassword, ...payload } = formData;

      const response = await fetch('http://localhost:9091/api/auth/register/workshop', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showToast('¡Taller registrado con éxito! Por favor, verifica tu correo electrónico antes de iniciar sesión.', 'success');
        navigate('/login');
      } else {
        const errorMsg = await getErrorMessage(response);
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      showToast('Error de conexión con el servidor.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    formData, 
    setFormData,
    handleChange, 
    registerWorkshop, 
    isLoading 
  };
}