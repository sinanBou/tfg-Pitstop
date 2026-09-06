import { type VehicleRequest } from '@/features/client';
import { SearchableSelect } from '@/components/common/SearchableSelect/SearchableSelect';
import { BaseModal } from '@/components/common/BaseModal/BaseModal';
import { useVehicleForm } from '../hooks/useVehicleForm';
import { useTranslation } from '@/i18n';

// 1. Definimos una interfaz clara para las props del Modal
/**
 * Propiedades del componente VehicleModal.
 */
interface VehicleModalProps {
  /** Indica si la modal de registro de vehículo está visible/abierta. */
  isOpen: boolean;
  /** Callback ejecutado al cancelar o cerrar la modal. */
  onClose: () => void;
  /** Callback para guardar el vehículo registrado en el servidor. Devuelve true si la creación es exitosa. */
  onSubmit: (data: VehicleRequest) => Promise<boolean>;
  /** Callback para cargar las marcas del catálogo general. */
  fetchMakes: () => Promise<string[]>;
  /** Callback para filtrar los modelos asociados a la marca seleccionada. */
  fetchModels: (make: string) => Promise<string[]>;
}

const POPULAR_BRANDS = [
  "AUDI", "BMW", "CITROEN", "FORD", "HYUNDAI", "KIA", 
  "MERCEDES-BENZ", "NISSAN", "OPEL", "PEUGEOT", "RENAULT", 
  "SEAT", "TOYOTA", "VOLKSWAGEN"
];

/**
 * Modal interactiva para el registro de vehículos nuevos.
 * Permite buscar marcas y modelos del catálogo mediante selectores con autocompletado y
 * registrar metadatos del coche como matrícula, número de bastidor (VIN), año de fabricación y color.
 */
export const VehicleModal = ({ isOpen, onClose, onSubmit, fetchMakes, fetchModels }: VehicleModalProps) => {
  const { t } = useTranslation();
  const {
    loading,
    makes,
    models,
    formData,
    setFormData,
    handleSubmit
  } = useVehicleForm({ isOpen, onClose, onSubmit, fetchMakes, fetchModels });

  // Si no está abierto, no renderizamos nada
  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('vehicleModal.title')}
      theme="blue"
      showDot={false}
    >
      <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col justify-between h-full">
          <div className="grid grid-cols-2 gap-4">
            <SearchableSelect 
              label={t('vehicleModal.brand')} 
              placeholder={t('vehicleModal.placeholderSelect')} 
              options={makes} 
              value={formData.brand} 
              onChange={val => setFormData({...formData, brand: val, model: ''})} 
              popularOptions={POPULAR_BRANDS}
            />
            <SearchableSelect 
              label={t('vehicleModal.model')} 
              placeholder={t('vehicleModal.placeholderSelect')} 
              options={models} 
              value={formData.model} 
              onChange={val => setFormData({...formData, model: val})} 
              disabled={!formData.brand}
            />
          </div>


          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-neutral-500 ml-2">{t('vehicleModal.licensePlate')}</label>
              <input 
                required
                type="text" 
                placeholder="0000XXX"
                className="w-full bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-neutral-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white font-mono tracking-wider focus:border-blue-500 focus:bg-white dark:focus:bg-black/80 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-neutral-700"
                value={formData.licensePlate}
                onChange={e => setFormData({...formData, licensePlate: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-neutral-500 ml-2">{t('vehicleModal.year')}</label>
              <input 
                required
                type="number" 
                className="w-full bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-neutral-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-black/80 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-neutral-700"
                value={formData.year}
                onChange={e => setFormData({...formData, year: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-neutral-500 ml-2">{t('vehicleModal.vin')}</label>
            <input 
              type="text" 
              placeholder={t('vehicleModal.placeholderVin')}
              className="w-full bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-neutral-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white font-mono focus:border-blue-500 focus:bg-white dark:focus:bg-black/80 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-neutral-700"
              value={formData.vin}
              onChange={e => setFormData({...formData, vin: e.target.value.toUpperCase()})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-neutral-500 ml-2">{t('vehicleModal.color')}</label>
            <input 
              type="text" 
              placeholder={t('vehicleModal.placeholderColor')}
              className="w-full bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-neutral-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-black/80 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-neutral-700"
              value={formData.color}
              onChange={e => setFormData({...formData, color: e.target.value})}
            />
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-neutral-800/50 mt-4 -mx-8 px-8 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-neutral-800 text-slate-600 dark:text-neutral-400 text-xs font-black uppercase hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-xs font-black uppercase hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? t('common.processing') : t('vehicleModal.confirmBtn')}
            </button>
          </div>
        </form>
    </BaseModal>
  );
};