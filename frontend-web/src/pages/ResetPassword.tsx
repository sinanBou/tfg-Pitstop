import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import InputGroup from '@/components/common/InputGroup/InputGroup';
import { Button } from '@/components/common/Button/Button';
import { resetPassword } from '@/features/auth/services/authService';
import { useToast } from '@/hooks/useToast';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
    general: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '', general: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;
    const newErrors = { password: '', confirmPassword: '', general: '' };

    if (!token) {
      newErrors.general = 'Falta el token de recuperación en la dirección URL.';
      setErrors(newErrors);
      toast.error(newErrors.general);
      return;
    }

    if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
      hasError = true;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, formData.password);
      toast.success('Tu contraseña se ha actualizado con éxito.');
      navigate('/login');
    } catch (err: any) {
      const msg = err.message || 'Error al restablecer la contraseña.';
      newErrors.general = msg;
      setErrors(newErrors);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-6 relative bg-zinc-950 font-sans selection:bg-blue-500/30 selection:text-white overflow-hidden">
      
      {/* Fondo Glow estático */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none z-0"></div>

      <div className="w-full max-w-lg z-10 animate-fade-in-up">
        
        {/* Card Contenedor */}
        <div className="bg-neutral-950/60 backdrop-blur-xl p-10 sm:p-12 rounded-[2.5rem] border border-neutral-800/60 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">

          <div className="mb-10 text-center">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Nueva Clave</h2>
            <p className="text-neutral-500 text-sm font-medium tracking-wide">Introduce tu nueva contraseña de acceso</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <InputGroup 
              label="Nueva Contraseña" 
              name="password" 
              type="password" 
              value={formData.password} 
              onChange={handleChange} 
              error={errors.password} 
              placeholder="••••••••" 
            />

            <InputGroup 
              label="Confirmar Nueva Contraseña" 
              name="confirmPassword" 
              type="password" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              error={errors.confirmPassword} 
              placeholder="••••••••" 
            />

            {errors.general && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                 <p className="text-red-400 text-xs font-black uppercase tracking-widest">{errors.general}</p>
              </div>
            )}

            <Button 
              type="submit"
              disabled={isLoading}
              variant="primary"
              className="mt-6 w-full py-4 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]"
            >
              {isLoading ? 'Guardando...' : 'Cambiar contraseña'}
            </Button>
          </form>
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export default ResetPassword;
