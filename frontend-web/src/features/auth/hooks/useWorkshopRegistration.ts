import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useWorkshopRegistration() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // El estado inicial para el dueño (propietario) pide los mismos datos personales que el cliente
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    address: '',
    nif: '',
    phoneNumber: '',
  });

  /**
   * Manejador de cambios modular que soporta tanto inputs de texto
   * como la lógica de máscara para los campos de hora.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /**
   * Función para realizar el envío de datos al backend.
   */
  const registerWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:9091/api/auth/register/owner', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Propietario registrado con éxito');
        navigate('/login');
      } else {
        const error = await response.text();
        alert(`Error: ${error}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert('Error de conexión con el servidor');
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