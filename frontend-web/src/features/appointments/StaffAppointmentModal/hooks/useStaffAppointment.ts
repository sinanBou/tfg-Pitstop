import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import type { ClientSearchDTO, VehicleSearchDTO, VehicleRequest } from '@/features/client';
import * as service from '../services/staffAppointmentService';

/**
 * Hook personalizado para gestionar el flujo secuencial de creación de citas por parte del personal del taller (staff/manager).
 * Coordina la búsqueda/registro manual de clientes, selección/registro de vehículos y asignación horaria/empleados.
 * 
 * @param workshopId Identificador único del taller donde se crea la cita.
 * @param onSuccess Función callback que se ejecuta tras registrar exitosamente la cita en el sistema.
 * @param isOpen Estado de apertura del modal que envuelve este flujo (reinicia o activa efectos).
 * @returns Estado del flujo, variables de formulario, catálogo de vehículos y funciones controladoras de cada paso.
 */
export function useStaffAppointment(workshopId: string, onSuccess: () => void, isOpen: boolean) {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{clients: ClientSearchDTO[], vehicles: VehicleSearchDTO[]}>({
    clients: [],
    vehicles: []
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Debouce Search Effect
  useEffect(() => {
    if (!isOpen || step !== 1) return;
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        handleSearch(0, true);
      } else {
        setSearchResults({ clients: [], vehicles: [] });
      }
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, step, isOpen]);

  // Selección state
  const [selectedClient, setSelectedClient] = useState<ClientSearchDTO | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleSearchDTO | null>(null);

  // Form states
  const [isNewClient, setIsNewClient] = useState(false);
  const [clientForm, setClientForm] = useState({
    firstname: '',
    lastname: '',
    nif: '',
    phoneNumber: '',
    email: ''
  });

  const [isNewVehicle, setIsNewVehicle] = useState(false);
  const [vehicleForm, setVehicleForm] = useState<VehicleRequest>({
    brand: '',
    model: '',
    licensePlate: '',
    year: new Date().getFullYear(),
    vin: '',
    color: ''
  });

  const [appointmentForm, setAppointmentForm] = useState({
    date: '',
    time: '',
    serviceType: '',
    description: '',
    estimatedDuration: 60,
    assignedEmployeeId: ''
  });

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [workshopSettings, setWorkshopSettings] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);

  // Catalog state
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && workshopId) {
      // Fetch workshop settings
      service.fetchWorkshopSettings(workshopId)
        .then(data => setWorkshopSettings(data))
        .catch(err => console.error("Error fetching workshop settings:", err));

      // Fetch employees for assignment
      service.fetchEmployees(workshopId)
        .then(data => setEmployees(data))
        .catch(err => console.error("Error fetching employees:", err));
    }
  }, [isOpen, workshopId]);

  useEffect(() => {
    if (isNewVehicle && makes.length === 0) {
      service.fetchCatalogMakes()
        .then(setMakes)
        .catch(err => console.error("Error fetching makes:", err));
    }
  }, [isNewVehicle, makes.length]);

  useEffect(() => {
    if (vehicleForm.brand) {
      service.fetchCatalogModels(vehicleForm.brand)
        .then(setModels)
        .catch(err => console.error("Error fetching models:", err));
    } else {
      setModels([]);
    }
  }, [vehicleForm.brand]);

  /**
   * Realiza una búsqueda paginada de clientes e intenta autocompletar vehículos por matrícula.
   * Si la búsqueda de vehículos devuelve exactamente un resultado, lo selecciona automáticamente.
   * 
   * @param pageIdx Índice de página para la paginación de clientes (comienza en 0).
   * @param isNewSearch Indica si es una nueva búsqueda o si se están cargando más resultados (paginación).
   */
  const handleSearch = async (pageIdx = 0, isNewSearch = true) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const [cData, vData] = await Promise.all([
        service.searchClients(searchQuery, pageIdx),
        isNewSearch ? service.searchVehiclesByPlate(searchQuery).catch(() => []) : Promise.resolve(null)
      ]);

      let newClients: ClientSearchDTO[] = cData.content || [];
      setHasMore(!cData.last);
      setCurrentPage(pageIdx);

      const vehicles = vData !== null ? vData : (isNewSearch ? [] : searchResults.vehicles);

      setSearchResults(prev => ({
        clients: isNewSearch ? newClients : [...prev.clients, ...newClients],
        vehicles
      }));
      
      if (isNewSearch && vehicles.length === 1) {
        handleSelectVehicle(vehicles[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejador para seleccionar un cliente existente. Limpia la búsqueda actual,
   * solicita los vehículos de dicho cliente y avanza al paso de selección de vehículo (Paso 2).
   * 
   * @param client Objeto con los datos del cliente seleccionado.
   */
  const handleSelectClient = async (client: ClientSearchDTO) => {
    setSelectedClient(client);
    setSearchQuery('');
    setSearchResults({ clients: [], vehicles: [] });
    setCurrentPage(0);
    setHasMore(false);
    
    try {
      const vehicles = await service.fetchClientVehicles(client.id);
      setSearchResults(prev => ({ ...prev, vehicles }));
    } catch (err) {
      console.error("Error fetching client vehicles:", err);
    }
    setStep(2);
  };

  /**
   * Manejador para la selección de un vehículo. Asigna el vehículo seleccionado
   * y avanza al paso de configuración de la cita (Paso 3).
   * 
   * @param vehicle Objeto con los datos del vehículo seleccionado.
   */
  const handleSelectVehicle = (vehicle: VehicleSearchDTO) => {
    setSelectedVehicle(vehicle);
    setStep(3);
  };

  /**
   * Registra manualmente un nuevo cliente en el sistema a partir de los datos del formulario `clientForm`.
   * Tras la creación exitosa, selecciona al cliente y avanza al paso 2.
   */
  const handleCreateClient = async () => {
    setLoading(true);
    try {
      const client = await service.manualRegisterClient(clientForm);
      setSelectedClient(client);
      setStep(2);
    } catch (err: any) {
      console.error(err);
      toast.error("Error al crear cliente: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registra un nuevo vehículo para el cliente seleccionado a partir de los datos del formulario `vehicleForm`.
   * Vincula el vehículo al cliente en la base de datos y avanza al paso 3 tras finalizar con éxito.
   */
  const handleCreateVehicle = async () => {
    if (!selectedClient) return;
    setLoading(true);
    try {
      const vehicle = await service.registerVehicleForClient(selectedClient.id, vehicleForm);
      setSelectedVehicle(vehicle);
      setStep(3);
    } catch (err) {
      console.error(err);
      toast.error("Error al crear vehículo");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Consulta las franjas horarias disponibles para el taller y fecha seleccionados.
   * Filtra las franjas que están ocupadas y guarda las horas libres formateadas (HH:MM).
   * 
   * @param date Fecha seleccionada en formato ISO (YYYY-MM-DD).
   */
  const fetchSlots = async (date: string) => {
    try {
      const data = await service.fetchAvailabilitySlots(workshopId, date);
      setAvailableSlots(data.filter((s: any) => s.available).map((s: any) => s.time.slice(0, 5)));
    } catch (err) {
      console.error("Error fetching availability slots:", err);
    }
  };

  /**
   * Finaliza la creación de la cita enviando toda la información recopilada al backend.
   * Realiza el formateo del payload, la asignación de mecánico y gestiona los estados de carga.
   * 
   * @returns `true` si la cita se creó exitosamente, de lo contrario `false`.
   */
  const handleFinish = async () => {
    if (!selectedVehicle || !appointmentForm.date || !appointmentForm.time) return false;
    setLoading(true);
    try {
      const [year, month, day] = appointmentForm.date.split('-');
      const dateTime = `${year}-${month}-${day}T${appointmentForm.time}:00`;

      const success = await service.createStaffAppointment({
        workshopId,
        vehicleId: selectedVehicle.id,
        dateTime,
        serviceType: appointmentForm.serviceType,
        description: appointmentForm.description,
        estimatedDuration: appointmentForm.estimatedDuration,
        assignedEmployeeId: appointmentForm.assignedEmployeeId || null
      });

      if (success) {
        onSuccess();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Error al registrar la cita');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Restablece todos los estados internos, formularios y selecciones del hook
   * a sus valores iniciales por defecto.
   */
  const reset = () => {
    setStep(1);
    setSelectedClient(null);
    setSelectedVehicle(null);
    setSearchQuery('');
    setIsNewClient(false);
    setIsNewVehicle(false);
    setModels([]);
    setAvailableSlots([]);
    setClientForm({ firstname: '', lastname: '', nif: '', phoneNumber: '', email: '' });
    setAppointmentForm({
      date: '',
      time: '',
      serviceType: '',
      description: '',
      estimatedDuration: 60,
      assignedEmployeeId: ''
    });
  };

  return {
    step, setStep,
    loading,
    searchQuery, setSearchQuery,
    searchResults,
    currentPage,
    hasMore,
    selectedClient, setSelectedClient,
    selectedVehicle, setSelectedVehicle,
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
    employees,
    handleSearch,
    handleSelectClient,
    handleSelectVehicle,
    handleCreateClient,
    handleCreateVehicle,
    handleFinish,
    fetchSlots,
    reset
  };
}
