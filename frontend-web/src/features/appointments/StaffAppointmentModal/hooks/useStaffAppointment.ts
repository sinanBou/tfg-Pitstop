import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import type { ClientSearchDTO, VehicleSearchDTO, VehicleRequest } from '@/types/client';
import * as service from '../services/staffAppointmentService';

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

  const handleSelectVehicle = (vehicle: VehicleSearchDTO) => {
    setSelectedVehicle(vehicle);
    setStep(3);
  };

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

  const fetchSlots = async (date: string) => {
    try {
      const data = await service.fetchAvailabilitySlots(workshopId, date);
      setAvailableSlots(data.filter((s: any) => s.available).map((s: any) => s.time.slice(0, 5)));
    } catch (err) {
      console.error("Error fetching availability slots:", err);
    }
  };

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
    } catch (err) {
      console.error(err);
      toast.error("Error al registrar la cita");
      return false;
    } finally {
      setLoading(false);
    }
  };

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
