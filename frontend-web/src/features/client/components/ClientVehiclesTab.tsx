import { useState } from 'react';
import { VehicleCard } from '@/components/common/Card/VehicleCard';
import { Card } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { ConfirmCardModal } from '@/components/common/ConfirmCardModal';
import { Plus, Building } from '@/assets/icons';
import { useTranslation } from '@/i18n';

/**
 * Propiedades del componente ClientVehiclesTab.
 */
interface ClientVehiclesTabProps {
  /** Listado de vehículos registrados del cliente. */
  vehicles: any[];
  /** Callback para abrir el formulario de añadir nuevo vehículo. */
  onAddVehicle: () => void;
  /** Callback para borrar un vehículo por su identificador único. */
  onDeleteVehicle: (id: string) => void;
}

/**
 * Pestaña de gestión del Garaje del cliente.
 * Lista todos los vehículos de su propiedad y proporciona el botón para añadir nuevos,
 * junto con la confirmación de eliminación segura por medio de un modal premium.
 */
export function ClientVehiclesTab({ vehicles, onAddVehicle, onDeleteVehicle }: ClientVehiclesTabProps) {
  const { t } = useTranslation();
  // Estados para controlar el modal de confirmación premium
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    try {
      await onDeleteVehicle(confirmDeleteId);
      setConfirmDeleteId(null);
      setConfirmDeleteName('');
    } catch (err) {
      console.error('Error deleting vehicle:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-10 animate-fade-in">
         <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest">{t('clientDashboard.myGarageTitle')}</h2>
            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{t('clientDashboard.manageActiveFleet')}</p>
         </div>
         <Button 
            onClick={onAddVehicle}
            variant="primary"
            className="shadow-[0_0_30px_rgba(239,68,68,0.1)] hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] flex items-center gap-2"
         >
            <Plus className="w-4 h-4" strokeWidth={3} />
            {t('clientDashboard.addVehicle')}
         </Button>
      </div>

      {vehicles.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((v, index) => (
               <VehicleCard 
                  key={v.id} 
                  brand={`${v.brand} ${v.model}`} 
                  plate={v.licensePlate} 
                  index={index} 
                  variant="blue"
                  onDelete={() => {
                     setConfirmDeleteId(v.id);
                     setConfirmDeleteName(`${v.brand} ${v.model} (${v.licensePlate})`);
                  }}
               />
            ))}
         </div>
      ) : (
         <Card variant="neutral" padding="none" rounded="2xl" className="py-32 flex flex-col items-center justify-center bg-black/20 border border-dashed border-neutral-800">
            <Building className="w-16 h-16 text-neutral-800 mb-6" strokeWidth={1} />
            <p className="text-neutral-600 font-black uppercase tracking-[0.3em] text-xs">{t('clientDashboard.emptyGarage')}</p>
         </Card>
      )}

      {/* COMPONENTE DE CONFIRMACIÓN REUTILIZABLE */}
      <ConfirmCardModal
         isOpen={!!confirmDeleteId}
         onClose={() => {
            setConfirmDeleteId(null);
            setConfirmDeleteName('');
         }}
         onConfirm={handleDeleteConfirm}
         title={t('clientDashboard.deleteVehicleTitle')}
         description={`${t('clientDashboard.deleteVehicleDesc')} ${confirmDeleteName ? `("${confirmDeleteName}")` : ''}`}
         confirmText={t('common.confirm')}
         cancelText={t('common.cancel')}
         theme="red"
         isLoading={isDeleting}
      />
    </div>
  );
}
