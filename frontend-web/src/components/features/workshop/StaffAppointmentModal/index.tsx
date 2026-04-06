import React from 'react';
import { useStaffAppointment } from './hooks/useStaffAppointment';
import { ClientStep } from './components/ClientStep';
import { VehicleStep } from './components/VehicleStep';
import { AppointmentStep } from './components/AppointmentStep';

interface StaffAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  workshopId: string;
  onSuccess: () => void;
}

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

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay con desenfoque suave */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300" onClick={handleClose} />
      
      <div className="relative bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-neutral-800 rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Barra de Progreso Dinámica */}
        <div className="flex h-1.5 w-full bg-neutral-900 shrink-0">
          <div 
            className="bg-red-600 transition-all duration-700 ease-in-out relative shadow-[0_0_10px_rgba(220,38,38,0.5)]" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Cabecera Premium */}
        <div className="p-8 pb-4 border-b border-neutral-800/50 bg-neutral-950/20 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-white text-2xl font-black uppercase tracking-[0.1em] flex items-center gap-3 italic">
              Nueva Cita <span className="text-red-600 text-sm">Presencial</span>
            </h2>
            <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mt-1 opacity-60">Paso 0{step} de 03</p>
          </div>
          <button onClick={handleClose} className="p-3 text-neutral-500 hover:text-white hover:bg-neutral-800/50 rounded-2xl transition-all active:scale-90">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Contenido Modular con Scroll Independiente */}
        <div className="flex-1 overflow-y-auto p-8 pt-6 custom-scrollbar animate-fade-in-up">
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
        
        {/* Footer Glow Decorativo */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-red-600/5 to-transparent pointer-events-none -z-10"></div>
      </div>
    </div>
  );
};
