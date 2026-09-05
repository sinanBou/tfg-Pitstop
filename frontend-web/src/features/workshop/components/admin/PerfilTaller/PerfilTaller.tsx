import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/common/Button/Button';
import { ConfirmCardModal } from '@/components/common/ConfirmCardModal';
import { X, Building2, Camera } from '@/assets/icons';
import { useTranslation } from '@/i18n';

/**
 * Propiedades del componente PerfilTaller.
 */
interface PerfilTallerProps {
  /** Determina si la modal del perfil del taller está visible o no. */
  isOpen: boolean;
  /** Callback para cerrar la modal. */
  onClose: () => void;
  /** Estructura de datos del formulario con campos operativos del taller. */
  settingsForm: {
    openTime: string;
    closeTime: string;
    slotDurationMinutes: string | number;
    hourlyRate: string | number;
    workingDays: string[];
    includeOwnerInPlanning: boolean;
  };
  /** Callback para actualizar el estado del formulario en la vista contenedora. */
  setSettingsForm: (form: any) => void;
  /** Callback para enviar los cambios de configuración al servidor. */
  onSubmit: (e: React.FormEvent) => void;
  /** URL de la imagen del logotipo actual del taller (opcional). */
  workshopLogoUrl?: string;
  /** Callback asíncrono para subir un archivo como logotipo (opcional). */
  onUploadLogo?: (file: File) => Promise<boolean | void>;
  /** Callback asíncrono para borrar el logotipo actual (opcional). */
  onDeleteLogo?: () => Promise<boolean | void>;
  /** Callback para previsualizar el logotipo a tamaño completo (opcional). */
  onPreviewLogo?: () => void;
}

const diasSemana = [
  { value: 'LUNES', labelKey: 'days.monday' },
  { value: 'MARTES', labelKey: 'days.tuesday' },
  { value: 'MIERCOLES', labelKey: 'days.wednesday' },
  { value: 'JUEVES', labelKey: 'days.thursday' },
  { value: 'VIERNES', labelKey: 'days.friday' },
  { value: 'SABADO', labelKey: 'days.saturday' },
  { value: 'DOMINGO', labelKey: 'days.sunday' }
];

/**
 * Modal de configuración operativa del taller (PerfilTaller).
 * Presenta opciones para definir horas de apertura/cierre, precio mano de obra,
 * días laborables semanales y subida del logo corporativo de la marca.
 */
export const PerfilTaller: React.FC<PerfilTallerProps> = ({
  isOpen,
  onClose,
  settingsForm,
  setSettingsForm,
  onSubmit,
  workshopLogoUrl,
  onUploadLogo,
  onDeleteLogo,
  onPreviewLogo,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUploadLogo) {
      setUploadingLogo(true);
      await onUploadLogo(e.target.files[0]);
      setUploadingLogo(false);
    }
  };

  const handleDeleteClick = () => {
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsConfirmDeleteOpen(false);
    if (onDeleteLogo) {
      setUploadingLogo(true);
      await onDeleteLogo();
      setUploadingLogo(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-6 bg-black/80 backdrop-blur-3xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-[3rem] relative shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        {/* Glow decorativo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>

        {/* Botón cerrar — fuera del scroll container */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-8 right-8 p-3 bg-black/40 hover:bg-neutral-800 text-neutral-500 hover:text-white rounded-2xl transition-all z-50 cursor-pointer"
        >
          <X className="w-6 h-6" strokeWidth={2.5} />
        </button>

        {/* Contenido con scroll */}
        <div className="p-10 overflow-y-auto flex-1">
          <header className="mb-10 relative z-10 border-b border-white/5 pb-6">
            <p className="text-[10px] uppercase font-bold tracking-widest text-red-500 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              {t('common.workshopSettings')}
            </p>
            <h3 className="text-3xl font-black uppercase tracking-widest text-white">
              {t('profile.title')}
            </h3>
          </header>

          <form onSubmit={onSubmit} className="relative z-10 space-y-8">
            {/* Contenedor de subida de Logo del Taller */}
            {onUploadLogo && onDeleteLogo && onPreviewLogo && (
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
                    if (workshopLogoUrl) {
                      onPreviewLogo();
                    } else {
                      fileInputRef.current?.click();
                    }
                  }}
                  className="w-20 h-20 bg-neutral-950 border border-neutral-800 rounded-[2rem] flex items-center justify-center text-white font-black text-3xl shadow-2xl relative overflow-hidden group/avatar cursor-pointer shrink-0"
                >
                  {uploadingLogo ? (
                    <div className="w-6 h-6 border-t-2 border-red-600 rounded-full animate-spin"></div>
                  ) : workshopLogoUrl ? (
                    <img
                      src={workshopLogoUrl}
                      alt="Logo del Taller"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-neutral-600" strokeWidth={1.5} />
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
                      disabled={uploadingLogo}
                      className="px-3 py-1.5 text-[9px] h-fit"
                    >
                      {workshopLogoUrl ? t('profile.changeImage') : t('profile.addImage')}
                    </Button>
                    {workshopLogoUrl && (
                      <Button
                        variant="secondary"
                        onClick={onPreviewLogo}
                        className="px-3 py-1.5 text-[9px] h-fit"
                      >
                        {t('profile.viewPhoto')}
                      </Button>
                    )}
                    {workshopLogoUrl && (
                      <Button
                        variant="danger"
                        onClick={handleDeleteClick}
                        disabled={uploadingLogo}
                        className="px-3 py-1.5 text-[9px] h-fit"
                      >
                        {t('profile.deletePhoto')}
                      </Button>
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-500 font-medium">{t('profile.photoRestrictions')}</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">{t('workshopCreationModal.openTime')}</label>
                <input
                  type="time"
                  value={settingsForm.openTime}
                  onChange={e => setSettingsForm({ ...settingsForm, openTime: e.target.value })}
                  style={{ colorScheme: 'dark' }}
                  className="bg-black/40 border border-neutral-800 text-white p-4 rounded-xl focus:outline-none focus:border-red-500 font-mono text-sm font-bold"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">{t('workshopCreationModal.closeTime')}</label>
                <input
                  type="time"
                  value={settingsForm.closeTime}
                  onChange={e => setSettingsForm({ ...settingsForm, closeTime: e.target.value })}
                  style={{ colorScheme: 'dark' }}
                  className="bg-black/40 border border-neutral-800 text-white p-4 rounded-xl focus:outline-none focus:border-red-500 font-mono text-sm font-bold"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">{t('appointmentModal.scheduledDate')}</label>
                <input
                  type="number"
                  value={settingsForm.slotDurationMinutes}
                  onChange={e => setSettingsForm({ ...settingsForm, slotDurationMinutes: e.target.value })}
                  className="bg-black/40 border border-neutral-800 text-white p-4 rounded-xl focus:outline-none focus:border-red-500 text-sm font-bold font-mono"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">{t('workshopDashboard.hourlyRate')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={settingsForm.hourlyRate}
                  onChange={e => setSettingsForm({ ...settingsForm, hourlyRate: e.target.value })}
                  className="bg-black/40 border border-neutral-800 text-white p-4 rounded-xl focus:outline-none focus:border-red-500 text-sm font-bold font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">{t('workshopCreationModal.operatingDays')}</label>
              <div className="flex flex-wrap gap-2">
                {diasSemana.map(dia => (
                  <button
                    type="button"
                    key={dia.value}
                    onClick={() => {
                      const workingDays = settingsForm.workingDays.includes(dia.value)
                        ? settingsForm.workingDays.filter((d: any) => d !== dia.value)
                        : [...settingsForm.workingDays, dia.value];
                      setSettingsForm({ ...settingsForm, workingDays });
                    }}
                    className={`px-4 py-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-200 active:scale-95 border cursor-pointer ${
                      settingsForm.workingDays.includes(dia.value)
                        ? 'bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.45)]'
                        : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    {t(dia.labelKey as any)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-black/40 border border-neutral-800 rounded-3xl gap-4">
              <div className="space-y-1 text-left">
                <h4 className="text-white text-xs font-black uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                  {t('workshopAdminDashboard.unassigned')}
                </h4>
                <p className="text-neutral-500 text-[10px] font-medium leading-relaxed">
                  Si se activa esta opción, el propietario del taller se incorporará a la agenda de planificación general y se le podrán asignar citas y tareas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSettingsForm({ ...settingsForm, includeOwnerInPlanning: !settingsForm.includeOwnerInPlanning })}
                className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                  settingsForm.includeOwnerInPlanning ? "bg-red-600" : "bg-neutral-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
                    settingsForm.includeOwnerInPlanning ? "translate-x-8" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                glow={true}
              >
                {t('common.saveChanges')}
              </Button>
            </div>
          </form>
        </div>
      </div>
      {isConfirmDeleteOpen && (
        <ConfirmCardModal
          isOpen={isConfirmDeleteOpen}
          onClose={() => setIsConfirmDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          title={t('profile.deletePhotoTitle')}
          description={t('profile.deletePhotoDesc')}
          confirmText={t('common.confirm')}
          theme="red"
        />
      )}
    </div>,
    document.body
  );
};

