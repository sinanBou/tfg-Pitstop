import React from 'react';
import { BaseModal } from '@/components/common/BaseModal/BaseModal';
import { ImagePreviewModal } from '@/components/common/ImagePreviewModal/ImagePreviewModal';
import { BackButton } from '@/components/common/BackButton/BackButton';
import { AlertTriangle } from '@/assets/icons';
import { useClientAppointment } from './hooks/useClientAppointment';
import { VehicleStep } from './components/VehicleStep';
import { WorkshopStep } from './components/WorkshopStep';
import { ScheduleStep } from './components/ScheduleStep';
import { DetailsStep } from './components/DetailsStep';
import type { ClientAppointmentModalProps } from './types/ClientAppointmentModal.types';

export const ClientAppointmentModal: React.FC<ClientAppointmentModalProps> = (props) => {
  const { isOpen, onClose, vehicles, workshops } = props;
  
  const {
    step,
    availableSlots,
    error,
    isLoadingSlots,
    previewOpen,
    setPreviewOpen,
    previewUrl,
    setPreviewUrl,
    previewTitle,
    setPreviewTitle,
    viewDate,
    setViewDate,
    formData,
    setFormData,
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    currentPage,
    hasMore,
    nextStep,
    prevStep,
    handleFinish,
    searchWorkshops
  } = useClientAppointment(props);

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva Cita"
      showDot={false}
      theme="blue"
      progressBarWidth={`${(step / 4) * 100}%`}
    >
      {error && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 shrink-0">
          <AlertTriangle className="w-5 h-5 text-blue-500 shrink-0" />
          <p className="text-xs text-blue-400 font-bold uppercase tracking-tight leading-tight">{error}</p>
        </div>
      )}

      {/* Contenido principal con animación para cada paso */}
      <div className="relative z-10 min-h-[300px] flex flex-col flex-1">
            
            {/* ENCABEZADOS DE PASOS COMUNES */}
            <div className="mb-8 flex items-center gap-4">
              {step > 1 && (
                <BackButton onClick={prevStep} title="Paso anterior" />
              )}
              <div>
                <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">{`Paso 0${step} / 04`}</p>
                <h3 className="text-2xl font-black uppercase text-white leading-none">
                  {step === 1 && "Tu Vehículo"}
                  {step === 2 && "El Taller"}
                  {step === 3 && "Horario"}
                  {step === 4 && "Servicio"}
                </h3>
              </div>
            </div>

            {/* PASO 1: SELECCIÓN DE VEHÍCULO */}
            {step === 1 && (
              <VehicleStep 
                vehicles={vehicles}
                selectedVehicleId={formData.vehicleId}
                onSelect={(vId) => {
                  setFormData(prev => ({ ...prev, vehicleId: vId }));
                  nextStep();
                }}
              />
            )}

            {/* PASO 2: SELECCIÓN DE TALLER (CON BÚSQUEDA PAGINADA) */}
            {step === 2 && (
              <WorkshopStep 
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                searchResults={searchResults}
                selectedWorkshopId={formData.workshopId}
                onSelect={(wId) => {
                  setFormData(prev => ({ ...prev, workshopId: wId }));
                  nextStep();
                }}
                isSearching={isSearching}
                hasMore={hasMore}
                onLoadMore={() => searchWorkshops(currentPage + 1, false)} // Búsqueda paginada de taller
                onPreviewLogo={(url, title) => {
                  setPreviewUrl(url);
                  setPreviewTitle(title);
                  setPreviewOpen(true);
                }}
              />
            )}

            {/* PASO 3: CALENDARIO Y DISPONIBILIDAD REAL */}
            {step === 3 && (
              <ScheduleStep 
                viewDate={viewDate}
                setViewDate={setViewDate}
                selectedWorkshopId={formData.workshopId}
                workshops={workshops}
                selectedDate={formData.date}
                selectedTime={formData.time}
                onSelectDate={(dateStr) => {
                  setFormData(prev => ({ ...prev, date: dateStr, time: '' }));
                }}
                onSelectTime={(hora) => {
                  setFormData(prev => ({ ...prev, time: hora }));
                  nextStep();
                }}
                availableSlots={availableSlots}
                isLoadingSlots={isLoadingSlots}
              />
            )}

            {/* PASO 4: DETALLES Y FINALIZACIÓN */}
            {step === 4 && (
              <DetailsStep 
                formData={formData}
                workshops={workshops}
                onServiceTypeChange={(type) => setFormData(prev => ({ ...prev, serviceType: type }))}
                onDescriptionChange={(desc) => setFormData(prev => ({ ...prev, description: desc }))}
                onFinish={handleFinish}
              />
            )}
      </div>

      {previewOpen && (
        <ImagePreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          imageUrl={previewUrl}
          title={previewTitle}
        />
      )}
    </BaseModal>
  );
};
