import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/common/Button';
import { InputField } from '@/components/common/InputField';
import { X, Check } from '@/assets/icons';
import { DeleteAccountSection } from '@/components/common/DeleteAccountSection';
import { useToast } from '@/hooks/useToast';
import { API_BASE_URL } from '@/config/api';
import { useTranslation } from '@/i18n';

/**
 * Propiedades del componente MiPerfilCliente.
 */
interface MiPerfilClienteProps {
  /** Determina si la modal del perfil está visible o no. */
  isOpen: boolean;
  /** Callback para cerrar la modal. */
  onClose: () => void;
  /** Datos inalterables del perfil del cliente (email, NIF). */
  clientProfile: {
    firstname: string;
    lastname: string;
    email: string;
    nif?: string;
    phoneNumber?: string;
    address?: string;
  };
  /** Modelo de datos del formulario con campos editables. */
  profileForm: {
    firstname: string;
    lastname: string;
    address: string;
    phoneNumber: string;
  };
  /** Callback para actualizar el estado del formulario de perfil local. */
  setProfileForm: (form: { firstname: string; lastname: string; address: string; phoneNumber: string }) => void;
  /** Callback asíncrono enviado al servidor al guardar los datos del perfil. */
  onSubmit: (form: { firstname: string; lastname: string; address: string; phoneNumber: string }) => Promise<void>;
}

/**
 * Modal de perfil personal para el cliente con estética premium azul.
 * Se renderiza mediante portal para evitar problemas de stacking context.
 * Permite cambiar datos personales (nombre, teléfono, dirección), cambiar la clave de acceso
 * y realizar la eliminación permanente de la cuenta de usuario.
 */
export const MiPerfilCliente: React.FC<MiPerfilClienteProps> = ({
  isOpen,
  onClose,
  clientProfile,
  profileForm,
  setProfileForm,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [profileSaved, setProfileSaved] = useState(false);
  const toast = useToast();

  // Estados para cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      setPasswordError(t('profile.passwordChanged'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t('auth.confirmPassword'));
      return;
    }

    setPasswordLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${API_BASE_URL}/users/change-password`, {
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
        setPasswordSuccess(t('profile.passwordChanged'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          setPasswordError(json.message || t('common.error'));
        } catch {
          setPasswordError(text || t('common.error'));
        }
      }
    } catch {
      setPasswordError(t('common.error'));
    } finally {
      setPasswordLoading(false);
    }
  };


  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        toast.success(t('profile.deleteAccountTitle'));
        setTimeout(() => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/login';
        }, 1500);
      } else {
        const text = await response.text();
        let errorMsg = t('common.error');
        try {
          const json = JSON.parse(text);
          errorMsg = json.message || errorMsg;
        } catch {
          errorMsg = text || errorMsg;
        }
        toast.error(errorMsg);
      }
    } catch {
      toast.error(t('common.error'));
    } finally {
      setDeleteLoading(false);
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
          <X className="w-6 h-6" />
        </button>

        {/* Contenido scrolleable */}
        <div className="p-10 overflow-y-auto flex-1 profile-scrollbar">
          <header className="mb-10 relative z-10 border-b border-white/5 pb-6">
            <h3 className="text-3xl font-black uppercase tracking-widest text-white">
              {t('profile.title')}
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
                label={t('profile.firstname')}
                required
                value={profileForm.firstname}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileForm({ ...profileForm, firstname: e.target.value })}
                focusVariant="blue"
              />
              <InputField
                label={t('profile.lastname')}
                required
                value={profileForm.lastname}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileForm({ ...profileForm, lastname: e.target.value })}
                focusVariant="blue"
              />
            </div>

            {/* Datos Fijos de Sistema */}
            <div className="grid grid-cols-2 gap-6">
              <InputField
                label={t('profile.emailFixed')}
                disabled
                value={clientProfile.email}
                mono
                focusVariant="blue"
              />
              <InputField
                label={t('profile.nifFixed')}
                disabled
                value={clientProfile.nif || t('common.none')}
                mono
                focusVariant="blue"
              />
            </div>

            {/* Datos Editables de Contacto */}
            <div className="grid grid-cols-2 gap-6">
              <InputField
                label={t('profile.contactPhone')}
                type="tel"
                required
                value={profileForm.phoneNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                placeholder={t('profile.phonePlaceholder')}
                focusVariant="blue"
              />
              <InputField
                label={t('profile.residenceAddress')}
                required
                value={profileForm.address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileForm({ ...profileForm, address: e.target.value })}
                placeholder={t('profile.addressPlaceholder')}
                focusVariant="blue"
              />
            </div>

            <div className="pt-4 flex justify-end items-center gap-4">
              {profileSaved && (
                <span className="text-emerald-500 text-xs font-black uppercase tracking-widest flex items-center gap-2 animate-fade-in-up">
                  <Check className="w-4 h-4" />
                  {t('profile.updatedSuccess')}
                </span>
              )}
              <Button
                type="submit"
                variant="primary"
                glow={false}
                className="bg-blue-600 hover:bg-blue-500 text-white"
              >
                {t('common.saveChanges')}
              </Button>
            </div>
          </form>

          {/* Separador */}
          <div className="my-10 border-b border-white/5"></div>

          {/* Sección de Cambio de Contraseña */}
          <section className="relative z-10 space-y-6">
            <h4 className="text-lg font-black uppercase tracking-widest text-white mb-2">
              {t('profile.securityPassword')}
            </h4>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <InputField
                  label={t('profile.currentPassword')}
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  focusVariant="blue"
                />
                <InputField
                  label={t('profile.newPassword')}
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                  placeholder="Mín. 6 caracteres"
                  focusVariant="blue"
                />
                <InputField
                  label={t('profile.repeatPassword')}
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
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
                  {passwordLoading ? t('common.processing') : t('profile.updatePasswordBtn')}
                </Button>
              </div>
            </form>
          </section>

          {/* Separador */}
          <div className="my-10 border-b border-white/5"></div>

          {/* Sección crítica: Eliminación de Cuenta */}
          <section className="relative z-10 pb-6">
            <DeleteAccountSection
              onDeleteAccount={handleDeleteAccount}
              isLoading={deleteLoading}
              warningMessage={t('profile.deleteAccountWarningClient')}
            />
          </section>
        </div>
      </div>
    </div>,
    document.body
  );
};
