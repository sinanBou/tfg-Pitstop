import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface MiPerfilProps {
  isOpen: boolean;
  onClose: () => void;
  employeeProfile: {
    profilePictureUrl?: string;
    firstname: string;
    lastname: string;
  };
  profileForm: {
    firstname: string;
    lastname: string;
    address: string;
  };
  setProfileForm: (form: { firstname: string; lastname: string; address: string }) => void;
  onSubmit: (form: { firstname: string; lastname: string; address: string }) => Promise<void>;
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

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
  const handleDeleteClick = async () => {
    if (confirm('¿Estás seguro de que deseas eliminar tu imagen de perfil?')) {
      setUploadingAvatar(true);
      await onDeleteAvatar();
      setUploadingAvatar(false);
    }
  };

  /** Submit del formulario con feedback visual */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(profileForm);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-6 bg-black/80 backdrop-blur-3xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-[3rem] relative shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        {/* Glow decorativo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>

        {/* Botón cerrar — sticky para que siempre sea visible al hacer scroll */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-8 right-8 p-3 bg-black/40 hover:bg-neutral-800 text-neutral-500 hover:text-white rounded-2xl transition-all z-50 cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Contenido con scroll */}
        <div className="p-10 overflow-y-auto flex-1">
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
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                </div>
              </div>

              <div className="flex flex-col gap-2 items-center sm:items-start">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    {employeeProfile.profilePictureUrl ? 'Cambiar Imagen' : 'Añadir Imagen'}
                  </button>
                  {employeeProfile.profilePictureUrl && (
                    <button
                      type="button"
                      onClick={onPreviewImage}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      Ver Foto
                    </button>
                  )}
                  {employeeProfile.profilePictureUrl && (
                    <button
                      type="button"
                      onClick={handleDeleteClick}
                      disabled={uploadingAvatar}
                      className="px-3 py-1.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-neutral-500 font-medium">PNG, JPG de hasta 5MB. S3 presigned-url cifrado.</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Nombre</label>
                <input
                  type="text"
                  required
                  value={profileForm.firstname}
                  onChange={e => setProfileForm({ ...profileForm, firstname: e.target.value })}
                  className="bg-black/40 border border-neutral-800 focus:border-red-500/50 text-white p-4 rounded-xl focus:outline-none transition-all text-sm font-bold"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Apellido</label>
                <input
                  type="text"
                  required
                  value={profileForm.lastname}
                  onChange={e => setProfileForm({ ...profileForm, lastname: e.target.value })}
                  className="bg-black/40 border border-neutral-800 focus:border-red-500/50 text-white p-4 rounded-xl focus:outline-none transition-all text-sm font-bold"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Dirección de Residencia</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                className="bg-black/40 border border-neutral-800 focus:border-red-500/50 text-white p-4 rounded-xl focus:outline-none transition-all text-sm font-bold placeholder:text-neutral-700"
                placeholder="Introduce tu dirección de residencia..."
              />
            </div>

            <div className="pt-4 flex justify-end items-center gap-4">
              {profileSaved && (
                <span className="text-green-500 text-xs font-black uppercase tracking-widest flex items-center gap-2 animate-fade-in-up">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Perfil actualizado
                </span>
              )}
              <button
                type="submit"
                className="px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] active:scale-95 transition-all"
              >
                Guardar Perfil
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
