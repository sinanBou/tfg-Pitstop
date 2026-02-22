import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useWorkshopRegistration() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '', lastname: '', email: '', password: '',
    workshopName: '', cif: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const registerWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:9091/api/auth/register/workshop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Taller registrado con éxito');
        navigate('/login');
      } else {
        const error = await response.text();
        alert(error);
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return { formData, handleChange, registerWorkshop, isLoading };
}