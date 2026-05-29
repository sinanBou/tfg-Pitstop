import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/utils/errorUtils';

interface LoginFormData {
  email: string;
  password: string;
  [key: string]: string;
}

export function useLogin() {
  const navigate = useNavigate();
  const { showToast } = useToast();
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
        const response = await fetch('http://localhost:9091/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email.trim().toLowerCase(), // Normalizar email en frontend también
            password: formData.password
          }),
        });

        if (response.ok) {
          const data = await response.json(); 
          
          if (data.token) {
            localStorage.setItem('jwt_token', data.token);
            localStorage.setItem('role', data.role);
          }

          showToast('¡Inicio de sesión exitoso!', 'success');

          // Redirección inteligente
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

        } else {
          const errorMsg = await getErrorMessage(response);
          setErrors({ general: errorMsg });
          showToast(errorMsg, 'error');
        }
      } catch {
        setErrors({ general: 'Error de conexión con el servidor.' });
        showToast('Error de conexión con el servidor.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async (idToken: string) => {
    setIsLoading(true);
    setErrors({});
    try {
      const response = await fetch('http://localhost:9091/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        const data = await response.json(); 
        
        if (data.token) {
          localStorage.setItem('jwt_token', data.token);
          localStorage.setItem('role', data.role);
        }

        showToast('¡Inicio de sesión con Google exitoso!', 'success');

        // Redirección inteligente
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

      } else {
        const errorMsg = await getErrorMessage(response);
        setErrors({ general: errorMsg });
        showToast(errorMsg, 'error');
      }
    } catch {
      setErrors({ general: 'Error de conexión con el servidor.' });
      showToast('Error de conexión con el servidor.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return { formData, errors, isLoading, handleChange, handleLogin, handleGoogleLogin };
}
