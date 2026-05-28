import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginFormData {
  email: string;
  password: string;
  [key: string]: string;
}

export function useLogin() {
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
        const response = await fetch('http://localhost:9091/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const data = await response.json(); 
          
          if (data.token) {
            localStorage.setItem('jwt_token', data.token);
            localStorage.setItem('role', data.role);
          }

          alert('¡Inicio de sesión exitoso!');

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
          const text = await response.text();
          setErrors({ general: text || 'Credenciales inválidas o error en el servidor.' });
          alert(text || 'Credenciales inválidas o error en el servidor.');
        }
      } catch {
        setErrors({ general: 'Error de conexión con el servidor.' });
        alert('Error de conexión con el servidor.');
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

        alert('¡Inicio de sesión con Google exitoso!');

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
        const errorMsg = response.status === 401 
          ? 'Acceso denegado. Tu cuenta debe ser registrada previamente por un administrador.'
          : 'Error en la autenticación con Google.';
        setErrors({ general: errorMsg });
        alert(errorMsg);
      }
    } catch {
      setErrors({ general: 'Error de conexión con el servidor.' });
      alert('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return { formData, errors, isLoading, handleChange, handleLogin, handleGoogleLogin };
}
