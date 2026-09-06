import { useState, useMemo } from 'react';
import { VehicleCard } from '@/components/common/Card/VehicleCard';
import { Card } from '@/components/common/Card/Card';
import { ConfirmCardModal } from '@/components/common/ConfirmCardModal';
import { Plus, Car } from '@/assets/icons';
import { useTranslation } from '@/i18n';

/**
 * Propiedades del componente ClientVehiclesTab.
 */
interface ClientVehiclesTabProps {
  /** Listado de vehículos registrados del cliente. */
  vehicles: any[];
  /** Listado de citas de reparación para derivar el estado en taller (opcional). */
  appointments?: any[];
  /** Callback para abrir el formulario de añadir nuevo vehículo. */
  onAddVehicle: () => void;
  /** Callback para borrar un vehículo por su identificador único. */
  onDeleteVehicle: (id: string) => void;
}

/**
 * Pestaña de gestión del Garaje del cliente.
 * Lista todos los vehículos de su propiedad con su estado operativo en tiempo real
 * y proporciona el botón para añadir nuevos junto con la confirmación de eliminación.
 */
export function ClientVehiclesTab({ 
  vehicles, 
  appointments = [], 
  onAddVehicle, 
  onDeleteVehicle 
}: ClientVehiclesTabProps) {
  const { t } = useTranslation();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Mapear estado en taller de cada vehículo
  const vehiclesWithStatus = useMemo(() => {
    return vehicles.map((v) => {
      const activeApp = appointments.find(
        (app) => app.vehicleId === v.id && !['CANCELLED', 'PICKED_UP'].includes(app.status)
      );
      
      if (!activeApp) {
        return { ...v, status: 'EN_CASA' };
      }
      
      return { ...v, status: activeApp.status };
    });
  }, [vehicles, appointments]);

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
    <div className="space-y-6 animate-fade-in-up">
      {/* Barra de cabecera con contador y acción */}
      <div className="flex items-center justify-between gap-4 bg-white/90 dark:bg-neutral-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-neutral-800/80 shadow-sm">
        <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 font-mono font-black text-xs sm:text-sm uppercase tracking-wider">
          {vehicles.length} {vehicles.length === 1 ? t('common.vehicle') : t('clientDashboard.activeVehicles')}
        </span>

        <button 
          onClick={onAddVehicle}
          className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-600/20 hover:shadow-blue-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>{t('clientDashboard.addVehicle')}</span>
        </button>
      </div>

      {vehiclesWithStatus.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehiclesWithStatus.map((v, index) => (
            <VehicleCard 
              key={v.id} 
              brand={`${v.brand} ${v.model}`} 
              plate={v.licensePlate} 
              status={v.status}
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
        <Card variant="neutral" padding="none" rounded="2xl" className="py-24 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-neutral-900/30 border border-dashed border-slate-200 dark:border-neutral-800">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <Car className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <p className="text-slate-700 dark:text-neutral-300 font-black uppercase tracking-widest text-sm mb-1">
            {t('clientDashboard.emptyGarage')}
          </p>
          <p className="text-slate-500 dark:text-neutral-500 text-xs max-w-sm text-center mb-5">
            {t('clientDashboard.noVehicles')}
          </p>
          <button
            onClick={onAddVehicle}
            className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>{t('clientDashboard.addVehicle')}</span>
          </button>
        </Card>
      )}

      {/* MODAL DE CONFIRMACIÓN REUTILIZABLE */}
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
