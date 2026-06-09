import React from 'react';
import { useStaffAppointment } from './hooks/useStaffAppointment';
import { ClientStep } from './components/ClientStep';
import { VehicleStep } from './components/VehicleStep';
import { AppointmentStep } from './components/AppointmentStep';
import { BaseModal } from '@/components/common/BaseModal/BaseModal';
import type { StaffAppointmentModalProps } from './types/StaffAppointmentModal.types';

/**
 * Modal multi-paso para la creación presencial de citas por parte del personal del taller (staff/admin).
 * Permite registrar citas directamente desde la mesa de recepción en 3 pasos:
 * 1. Búsqueda de un cliente existente por DNI/Email/Nombre o registro de un nuevo cliente.
 * 2. Asignación de un vehículo existente del cliente seleccionado o registro de un nuevo coche.
 * 3. Selección de fecha, hora (slots disponibles en tiempo real) y tipo de servicio para confirmar la cita.
 */
export const StaffAppointmentModal: React.FC<StaffAppointmentModalProps> = ({
  isOpen, onClose, workshopId, onSuccess
}) => {
  const {
    step, setStep,
    loading,
    searchQuery, setSearchQuery,
    searchResults,
    currentPage,
    hasMore,
    selectedClient,
    selectedVehicle,
    isNewClient, setIsNewClient,
    clientForm, setClientForm,
    isNewVehicle, setIsNewVehicle,
    vehicleForm, setVehicleForm,
    appointmentForm, setAppointmentForm,
    availableSlots,
    viewDate, setViewDate,
    workshopSettings,
    makes,
    models,
    handleSearch,
    handleSelectClient,
    handleSelectVehicle,
    handleCreateClient,
    handleCreateVehicle,
    handleFinish,
    fetchSlots,
    reset
  } = useStaffAppointment(workshopId, () => { onSuccess(); reset(); onClose(); }, isOpen);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nueva Cita Presencial"
      subtitle={`Paso 0${step} de 03`}
      theme="red"
      progressBarWidth={`${(step / 3) * 100}%`}
    >
      <div className="flex-1 flex flex-col">
        {step === 1 && (
          <ClientStep 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={handleSearch}
            loading={loading}
            searchResults={searchResults}
            currentPage={currentPage}
            hasMore={hasMore}
            onSelectClient={handleSelectClient}
            onSelectVehicle={handleSelectVehicle}
            isNewClient={isNewClient}
            setIsNewClient={setIsNewClient}
            clientForm={clientForm}
            setClientForm={setClientForm}
            onCreateClient={handleCreateClient}
          />
        )}

        {step === 2 && (
          <VehicleStep 
            selectedClient={selectedClient}
            searchResults={searchResults}
            onSelectVehicle={handleSelectVehicle}
            isNewVehicle={isNewVehicle}
            setIsNewVehicle={setIsNewVehicle}
            vehicleForm={vehicleForm}
            setVehicleForm={setVehicleForm}
            makes={makes}
            models={models}
            onCreateVehicle={handleCreateVehicle}
            loading={loading}
            onPrev={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <AppointmentStep 
            selectedVehicle={selectedVehicle}
            appointmentForm={appointmentForm}
            setAppointmentForm={setAppointmentForm}
            availableSlots={availableSlots}
            viewDate={viewDate}
            setViewDate={setViewDate}
            workshopSettings={workshopSettings}
            onPrev={() => setStep(2)}
            onFinish={handleFinish}
            loading={loading}
            onFetchSlots={fetchSlots}
          />
        )}
      </div>
    </BaseModal>
  );
};
