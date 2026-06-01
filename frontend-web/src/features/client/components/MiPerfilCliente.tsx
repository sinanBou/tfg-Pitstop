import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/common/Button';
import { InputField } from '@/components/common/InputField';

interface MiPerfilClienteProps {
  isOpen: boolean;
  onClose: () => void;
  clientProfile: {
    firstname: string;
    lastname: string;
    email: string;
    nif?: string;
    phoneNumber?: string;
    address?: string;
  };
  profileForm: {
    firstname: string;
    lastname: string;
    address: string;
    phoneNumber: string;
  };
  setProfileForm: (form: { firstname: string; lastname: string; address: string; phoneNumber: string }) => void;
  onSubmit: (form: { firstname: string; lastname: string; address: string; phoneNumber: string }) => Promise<void>;
}

/**
 * Modal de perfil personal para el cliente con estética premium azul.
 * Se renderiza mediante portal para evitar problemas de stacking context.
 */
export const MiPerfilCliente: React.FC<MiPerfilClienteProps> = ({
  isOpen,
  onClose,
  clientProfile,
  profileForm,
  setProfileForm,
  onSubmit,
}) => {
  const [profileSaved, setProfileSaved] = useState(false);

  // Estados para cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  if (!isOpen) return null;

  /** Envío del formulario de perfil */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(profileForm);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  /** Envío del formulario de contraseña */
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Las nuevas contraseñas no coinciden.');
      return;
    }

    setPasswordLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch('http://localhost:9091/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (response.ok) {
        setPasswordSuccess('Contraseña cambiada correctamente.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          setPasswordError(json.message || 'Error al cambiar la contraseña.');
        } catch {
          setPasswordError(text || 'La contraseña actual es incorrecta o no tiene permitido el cambio local.');
        }
      }
    } catch {
      setPasswordError('Error de conexión con el servidor.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-6 bg-black/80 backdrop-blur-3xl animate-in fade-in duration-300">
      <style>{`
        /* Estilo personalizado de scrollbar premium negra */
        .profile-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .profile-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .profile-scrollbar::-webkit-scrollbar-thumb {
          background: #000000;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .profile-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #080808;
        }
      `}</style>
      
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl relative shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Glow premium azul para cliente */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>

        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-8 right-8 p-3 bg-black/40 hover:bg-neutral-800 text-neutral-500 hover:text-white rounded-2xl transition-all z-50 cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Contenido scrolleable */}
        <div className="p-10 overflow-y-auto flex-1 profile-scrollbar">
          <header className="mb-10 relative z-10 border-b border-white/5 pb-6">
            <h3 className="text-3xl font-black uppercase tracking-widest text-white">
              Mi Perfil
            </h3>
          </header>

          <form onSubmit={handleFormSubmit} className="relative z-10 space-y-8">
            {/* Foto de perfil estática (iniciales) */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
              <div className="w-20 h-20 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-2xl relative overflow-hidden shrink-0 select-none">
                {profileForm.firstname.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex flex-col gap-1 items-center sm:items-start text-center sm:text-left">
                <h4 className="text-white font-bold text-base uppercase tracking-wider">
                  {profileForm.firstname} {profileForm.lastname}
                </h4>
                <p className="text-xs text-neutral-500 font-semibold">{clientProfile.email}</p>
              </div>
            </div>

            {/* Datos Personales */}
            <div className="grid grid-cols-2 gap-6">
              <InputField
                label="Nombre"
                required
                value={profileForm.firstname}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileForm({ ...profileForm, firstname: e.target.value })}
                focusVariant="blue"
              />
              <InputField
                label="Apellido"
                required
                value={profileForm.lastname}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileForm({ ...profileForm, lastname: e.target.value })}
                focusVariant="blue"
              />
            </div>

            {/* Datos Fijos de Sistema */}
            <div className="grid grid-cols-2 gap-6">
              <InputField
                label="Email (No modificable)"
                disabled
                value={clientProfile.email}
                mono
                focusVariant="blue"
              />
              <InputField
                label="NIF / CIF (No modificable)"
                disabled
                value={clientProfile.nif || 'No asignado'}
                mono
                focusVariant="blue"
              />
            </div>

            {/* Datos Editables de Contacto */}
            <div className="grid grid-cols-2 gap-6">
              <InputField
                label="Teléfono de Contacto"
                type="tel"
                required
                value={profileForm.phoneNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                placeholder="Introduce tu número de teléfono..."
                focusVariant="blue"
              />
              <InputField
                label="Dirección de Residencia"
                required
                value={profileForm.address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileForm({ ...profileForm, address: e.target.value })}
                placeholder="Introduce tu dirección de residencia..."
                focusVariant="blue"
              />
            </div>

            <div className="pt-4 flex justify-end items-center gap-4">
              {profileSaved && (
                <span className="text-emerald-500 text-xs font-black uppercase tracking-widest flex items-center gap-2 animate-fade-in-up">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Perfil actualizado con éxito
                </span>
              )}
              <Button
                type="submit"
                variant="primary"
                glow={false}
                className="bg-blue-600 hover:bg-blue-500 text-white"
              >
                Guardar Cambios
              </Button>
            </div>
          </form>

          {/* Separador */}
          <div className="my-10 border-b border-white/5"></div>

          {/* Sección de Cambio de Contraseña */}
          <section className="relative z-10 space-y-6">
            <h4 className="text-lg font-black uppercase tracking-widest text-white mb-2">
              Seguridad: Cambiar Contraseña
            </h4>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <InputField
                  label="Clave Actual"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  focusVariant="blue"
                />
                <InputField
                  label="Clave Nueva"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                  placeholder="Mín. 6 caracteres"
                  focusVariant="blue"
                />
                <InputField
                  label="Repetir Clave"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  focusVariant="blue"
                />
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center animate-fade-in-up">
                  <p className="text-red-400 text-xs font-black uppercase tracking-widest">{passwordError}</p>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center animate-fade-in-up">
                  <p className="text-emerald-400 text-xs font-black uppercase tracking-widest">{passwordSuccess}</p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={passwordLoading}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 hover:border-neutral-600 transition-all shadow-md active:scale-[0.98]"
                >
                  {passwordLoading ? 'Cambiando...' : 'Actualizar Contraseña'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>,
    document.body
  );
};
