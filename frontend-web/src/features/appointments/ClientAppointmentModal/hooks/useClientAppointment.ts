import { useState, useEffect } from 'react';
import type { AppointmentRequest, WorkshopMinDTO } from '@/features/client';
import { searchWorkshopsApi } from '../services/clientAppointmentService';

/**
 * Propiedades de configuración para el hook useClientAppointment.
 */
interface UseClientAppointmentProps {
  /** Indica si la modal de cita está abierta. */
  isOpen: boolean;
  /** Callback para cerrar la modal. */
  onClose: () => void;
  /** Listado estático inicial de talleres (para validaciones de workingDays). */
  workshops: WorkshopMinDTO[];
  /** Callback para enviar los datos de la nueva cita al servidor. */
  onSubmit: (data: AppointmentRequest) => Promise<boolean>;
  /** Callback asíncrono para obtener las horas/slots disponibles de un taller y fecha concreta. */
  fetchSlots: (workshopId: string, date: string) => Promise<string[]>;
  /** Listado de citas existentes del cliente para evitar duplicados en el mismo taller (opcional). */
  existingAppointments?: any[];
}

/**
 * Hook de negocio para gestionar el estado, validaciones y la navegación entre pasos
 * del flujo de creación de citas del cliente.
 * 
 * Controla:
 * - Selección de vehículo y taller (con paginación y retardo de búsqueda).
 * - Carga de disponibilidad del calendario y días festivos.
 * - Prevención de citas duplicadas para el mismo vehículo y taller.
 */
export const useClientAppointment = ({
  isOpen,
  onClose,
  workshops,
  onSubmit,
  fetchSlots,
  existingAppointments = []
}: UseClientAppointmentProps) => {
  const [step, setStep] = useState(1);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  
  // Estado para el mes actual del calendario personalizado
  const [viewDate, setViewDate] = useState(new Date());
  
  const [formData, setFormData] = useState<AppointmentRequest>({
    vehicleId: '',
    workshopId: '',
    date: '',
    time: '',
    serviceType: '',
    description: ''
  });

  // ESTADOS PARA BÚSQUEDA PAGINADA
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<WorkshopMinDTO[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const checkDuplicate = (vId: string, wId: string) => {
    return (existingAppointments as any[]).some((app: any) => 
      app.vehicleId && app.workshopId &&
      String(app.vehicleId) === String(vId) && 
      String(app.workshopId) === String(wId) &&
      app.status !== 'CANCELLED'
    );
  };

  // Reset al cerrar o abrir la modal
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setError(null);
      setAvailableSlots([]);
      setFormData({
        vehicleId: '', workshopId: '', date: '', 
        time: '', serviceType: '', description: ''
      });
      setSearchTerm('');
      setSearchResults([]);
      setCurrentPage(0);
      setHasMore(true);
    }
  }, [isOpen]);

  // EFECTO DE BÚSQUEDA CON DEBOUNCE
  useEffect(() => {
    if (step !== 2 || !isOpen) return;

    const delayDebounceFn = setTimeout(() => {
      searchWorkshops(0, true);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, step, isOpen]);

  const searchWorkshops = async (pageIdx: number, isNewSearch: boolean) => {
    setIsSearching(true);
    try {
      const data = await searchWorkshopsApi(searchTerm, pageIdx);
      const newResults = data.content;
      setSearchResults(prev => isNewSearch ? newResults : [...prev, ...newResults]);
      setHasMore(!data.last);
      setCurrentPage(pageIdx);
    } catch (err) {
      console.error("Error buscando talleres:", err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (formData.workshopId && formData.date && step === 3 && isOpen) {
      console.log("Consultando taller:", formData.workshopId, "para la fecha:", formData.date);

      // Verificamos si es un día laborable antes de hacer la petición
      const selectedWorkshop = workshops.find(w => w.id === formData.workshopId);
      if (selectedWorkshop && selectedWorkshop.workingDays) {
        const [year, month, day] = formData.date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
        const dayName = dias[dateObj.getDay()];
        if (!selectedWorkshop.workingDays.includes(dayName)) {
           setAvailableSlots([]);
           return;
        }
      }

      const loadSlots = async () => {
        setIsLoadingSlots(true);
        try {
          const slots = await fetchSlots(formData.workshopId, formData.date);
          console.log("Slots encontrados:", slots);
          setAvailableSlots(slots);
        } catch (err) {
          console.error("Error en fetchSlots:", err);
        } finally {
          setIsLoadingSlots(false);
        }
      };
      loadSlots();
    }
  }, [formData.date, formData.workshopId, step, fetchSlots, workshops, isOpen]);

  const nextStep = () => {
    setError(null);
    if (step === 2) {
      if (checkDuplicate(formData.vehicleId, formData.workshopId)) {
        setError("Ya tienes una cita asignada para este taller con este vehículo.");
        return;
      }
    }
    setStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  const handleFinish = async () => {
    setError(null);
    if (checkDuplicate(formData.vehicleId, formData.workshopId)) {
      setError("Ya tienes una cita asignada para este taller con este vehículo.");
      setStep(2);
      return;
    }
    const success = await onSubmit(formData);
    if (success) {
      setStep(1);
      setError(null);
      setAvailableSlots([]);
      setFormData({
        vehicleId: '', workshopId: '', date: '', 
        time: '', serviceType: '', description: ''
      });
      onClose();
    }
  };

  return {
    step,
    setStep,
    availableSlots,
    error,
    setError,
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
  };
};
