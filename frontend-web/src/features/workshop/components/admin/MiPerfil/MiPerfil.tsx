import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/common/Button';
import { ConfirmCardModal } from '@/components/common/ConfirmCardModal';
import { X, Camera, Check } from '@/assets/icons';
import { DeleteAccountSection } from '@/components/common/DeleteAccountSection';
import { useToast } from '@/hooks/useToast';
import { API_BASE_URL } from '@/config/api';

interface MiPerfilProps {
  isOpen: boolean;
  onClose: () => void;
  employeeProfile: {
    id?: string;
    employeeId?: string;
    profilePictureUrl?: string;
    firstname: string;
    lastname: string;
  };
  profileForm: {
    firstname: string;
    lastname: string;
    address: string;
    nif: string;
    phoneNumber: string;
  };
  setProfileForm: (form: { firstname: string; lastname: string; address: string; nif: string; phoneNumber: string }) => void;
  onSubmit: (form: { firstname: string; lastname: string; address: string; nif: string; phoneNumber: string }) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<boolean | void>;
  onDeleteAvatar: () => Promise<boolean | void>;
  onPreviewImage: () => void;
}

/**
 * Modal de perfil personal reutilizable.
 * Se renderiza mediante portal para garantizar z-index y evitar conflictos de stacking context.
 */
export const MiPerfil: React.FC<MiPerfilProps> = ({
  isOpen,
  onClose,
  employeeProfile,
  profileForm,
  setProfileForm,
  onSubmit,
  onUploadAvatar,
  onDeleteAvatar,
  onPreviewImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Estados para cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const userRole = localStorage.getItem('role') || '';
  const isOwner = userRole === 'WORKSHOP_OWNER';
  const [hasWorkshops, setHasWorkshops] = useState<boolean | null>(null);

  useEffect(() => {
    const ownerId = employeeProfile?.id || employeeProfile?.employeeId;
    if (userRole === 'WORKSHOP_OWNER' && ownerId && isOpen) {
      const fetchOwnerWorkshops = async () => {
        try {
          const token = localStorage.getItem('jwt_token');
          const response = await fetch(`${API_BASE_URL}/workshops/owner/${ownerId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setHasWorkshops(data && data.length > 0);
          } else {
            setHasWorkshops(true);
          }
        } catch {
          setHasWorkshops(true);
        }
      };
      fetchOwnerWorkshops();
    } else if (!isOpen) {
      setHasWorkshops(null);
    } else if (userRole !== 'WORKSHOP_OWNER') {
      setHasWorkshops(false);
    }
  }, [userRole, employeeProfile?.id, employeeProfile?.employeeId, isOpen]);

  if (!isOpen) return null;

  /** Wrapper seguro para la subida de avatar */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingAvatar(true);
      await onUploadAvatar(e.target.files[0]);
      setUploadingAvatar(false);
    }
  };

  /** Confirmación y borrado del avatar */
  const handleDeleteClick = () => {
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsConfirmDeleteOpen(false);
    setUploadingAvatar(true);
    await onDeleteAvatar();
    setUploadingAvatar(false);
  };

  /** Submit del formulario con feedback visual */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(profileForm);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  /** Submit del formulario de cambio de contraseña */
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
        toast.success('Tu cuenta ha sido eliminada correctamente.');
        setTimeout(() => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/login';
        }, 1500);
      } else {
        const text = await response.text();
        let errorMsg = 'Error al eliminar la cuenta.';
        try {
          const json = JSON.parse(text);
          errorMsg = json.message || errorMsg;
        } catch {
          errorMsg = text || errorMsg;
        }
        toast.error(errorMsg);
      }
    } catch {
      toast.error('Error de conexión con el servidor.');
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
      
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-[3rem] relative shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Glow decorativo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>

        {/* Botón cerrar — sticky para que siempre sea visible al hacer scroll */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-8 right-8 p-3 bg-black/40 hover:bg-neutral-800 text-neutral-500 hover:text-white rounded-2xl transition-all z-50 cursor-pointer"
        >
          <X className="w-6 h-6" strokeWidth={2.5} />
        </button>

        {/* Contenido con scroll */}
        <div className="p-10 overflow-y-auto flex-1 profile-scrollbar">
          <header className="mb-10 relative z-10 border-b border-white/5 pb-6">
            <p className="text-[10px] uppercase font-bold tracking-widest text-red-500 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Mis Datos Personales
            </p>
            <h3 className="text-3xl font-black uppercase tracking-widest text-white">
              Mi Perfil
            </h3>
          </header>

          <form onSubmit={handleFormSubmit} className="relative z-10 space-y-8">
            {/* Avatar Upload Container */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <div
                onClick={() => {
                  if (employeeProfile.profilePictureUrl) {
                    onPreviewImage();
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                className="w-20 h-20 bg-neutral-950 border border-neutral-800 rounded-[2rem] flex items-center justify-center text-white font-black text-3xl shadow-2xl relative overflow-hidden group/avatar cursor-pointer shrink-0"
              >
                {uploadingAvatar ? (
                  <div className="w-6 h-6 border-t-2 border-red-600 rounded-full animate-spin"></div>
                ) : employeeProfile.profilePictureUrl ? (
                  <img
                    src={employeeProfile.profilePictureUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profileForm.firstname.charAt(0) || '?'
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
              </div>

              <div className="flex flex-col gap-2 items-center sm:items-start">
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="px-3 py-1.5 text-[9px] h-fit"
                  >
                    {employeeProfile.profilePictureUrl ? 'Cambiar Imagen' : 'Añadir Imagen'}
                  </Button>
                  {employeeProfile.profilePictureUrl && (
                    <Button
                      variant="secondary"
                      onClick={onPreviewImage}
                      className="px-3 py-1.5 text-[9px] h-fit"
                    >
                      Ver Foto
                    </Button>
                  )}
                  {employeeProfile.profilePictureUrl && (
                    <Button
                      variant="danger"
                      onClick={handleDeleteClick}
                      disabled={uploadingAvatar}
                      className="px-3 py-1.5 text-[9px] h-fit"
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
                <p className="text-[10px] text-neutral-500 font-medium">PNG, JPG de hasta 5MB. S3 presigned-url cifrado.</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2 h-6 flex items-center">Nombre</label>
                <input
                  type="text"
                  required
                  value={profileForm.firstname}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileForm({ ...profileForm, firstname: e.target.value })}
                  className="bg-black/40 border border-neutral-800 focus:border-red-500/50 text-white p-4 rounded-xl focus:outline-none transition-all text-sm font-bold"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2 h-6 flex items-center">Apellido</label>
                <input
                  type="text"
                  required
                  value={profileForm.lastname}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileForm({ ...profileForm, lastname: e.target.value })}
                  className="bg-black/40 border border-neutral-800 focus:border-red-500/50 text-white p-4 rounded-xl focus:outline-none transition-all text-sm font-bold"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2 h-6 flex items-center">Dirección de Residencia</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="bg-black/40 border border-neutral-800 focus:border-red-500/50 text-white p-4 rounded-xl focus:outline-none transition-all text-sm font-bold placeholder:text-neutral-700"
                placeholder="Introduce tu dirección de residencia..."
              />
            </div>

            <div className="pt-4 flex justify-end items-center gap-4">
              {profileSaved && (
                <span className="text-green-500 text-xs font-black uppercase tracking-widest flex items-center gap-2 animate-fade-in-up">
                  <Check className="w-4 h-4" strokeWidth={2} />
                  Perfil actualizado
                </span>
              )}
              <Button
                type="submit"
                variant="primary"
                glow={true}
              >
                Guardar Perfil
              </Button>
            </div>
          </form>

          {/* Separador */}
          <div className="my-10 border-b border-white/5"></div>

          {/* Sección de Cambio de Contraseña */}
          <section className="relative z-10 space-y-6">
            <p className="text-[10px] uppercase font-bold tracking-widest text-red-500 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Seguridad: Cambiar Contraseña
            </p>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2 h-6 flex items-center">Clave Actual</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-black/40 border border-neutral-800 focus:border-red-500/50 text-white p-4 rounded-xl focus:outline-none transition-all text-sm font-bold placeholder:text-neutral-700"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2 h-6 flex items-center">Clave Nueva</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                    placeholder="Mín. 6 caracteres"
                    className="bg-black/40 border border-neutral-800 focus:border-red-500/50 text-white p-4 rounded-xl focus:outline-none transition-all text-sm font-bold placeholder:text-neutral-700"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2 h-6 flex items-center">Repetir Clave</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                    className="bg-black/40 border border-neutral-800 focus:border-red-500/50 text-white p-4 rounded-xl focus:outline-none transition-all text-sm font-bold placeholder:text-neutral-700"
                  />
                </div>
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center animate-fade-in-up">
                  <p className="text-red-400 text-xs font-black uppercase tracking-widest">{passwordError}</p>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center animate-fade-in-up">
                  <p className="text-green-400 text-xs font-black uppercase tracking-widest">{passwordSuccess}</p>
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

          {/* Separador */}
          <div className="my-10 border-b border-white/5"></div>

          {/* Sección crítica: Eliminación de Cuenta */}
          <section className="relative z-10 pb-6">
            <DeleteAccountSection
              onDeleteAccount={handleDeleteAccount}
              isLoading={deleteLoading}
              isDisabled={isOwner && hasWorkshops !== false}
              disabledMessage="Los propietarios de taller no pueden eliminar su cuenta directamente. Debes dar de baja tus talleres primero."
              warningMessage="Esta acción es irreversible. Se eliminarán permanentemente tus credenciales y te desvinculará de toda la gestión del taller."
            />
          </section>
        </div>
      </div>
      {isConfirmDeleteOpen && (
        <ConfirmCardModal
          isOpen={isConfirmDeleteOpen}
          onClose={() => setIsConfirmDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Eliminar Foto de Perfil"
          description="¿Estás seguro de que deseas eliminar tu imagen de perfil? Esta acción es instantánea."
          confirmText="Sí, Eliminar"
          theme="red"
        />
      )}
    </div>,
    document.body
  );
};
