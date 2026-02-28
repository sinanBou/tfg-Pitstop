import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useWorkshopRegistration() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // El estado inicial usa los nombres exactos de tu WorkshopRequest en Java
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    companyName: '', // Coincide con 'companyName' en el backend
    cif: '',
    openTime: '09:00', // Coincide con LocalTime 'openTime'
    closeTime: '18:00', // Coincide con LocalTime 'closeTime'
  });

  /**
   * Manejador de cambios modular que soporta tanto inputs de texto
   * como la lógica de máscara para los campos de hora.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;

  if (name === 'openTime' || name === 'closeTime') {
    // Obtenemos el valor anterior de forma segura
    const prevValue = formData[name as keyof typeof formData] as string;

    // Permitir borrar: si el valor nuevo es más corto, actualizamos sin procesar
    if (value.length < prevValue.length) {
      setFormData({ ...formData, [name]: value });
      return;
    }

    // Solo permitimos números para procesar la máscara
    let v = value.replace(/\D/g, '');

    // --- VALIDACIÓN DE RANGOS LOGICOS ---
    // 1. Validar las decenas de hora (máximo 2)
    if (v.length >= 1 && parseInt(v[0]) > 2) v = '2';
    
    // 2. Validar hora completa (máximo 23)
    if (v.length >= 2) {
      const hour = parseInt(v.slice(0, 2));
      if (hour > 23) v = '23' + v.slice(2);
    }

    // 3. Validar decenas de minutos (máximo 5)
    if (v.length >= 3) {
      const minDecena = parseInt(v[2]);
      if (minDecena > 5) v = v.slice(0, 2) + '5';
    }

    // --- APLICAR MÁSCARA HH:mm ---
    let formatted = v;
    if (v.length >= 3) {
      formatted = v.slice(0, 2) + ':' + v.slice(2, 4);
    } else {
      formatted = v.slice(0, 2);
    }

    setFormData({ ...formData, [name]: formatted });
    return;
  }

  setFormData({ ...formData, [name]: value });
};

  /**
   * Función para realizar el envío de datos al backend.
   */
  const registerWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Se envía el objeto formData directamente ya que los nombres coinciden con el DTO de Java
      const response = await fetch('http://localhost:9091/api/auth/register/workshop', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Taller registrado con éxito');
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