import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../../../config/api';
import { 
  type ClientSearchDTO, 
  type VehicleSearchDTO, 
  type VehicleRequest
} from '../../../../../types/client';

export function useStaffAppointment(workshopId: string, onSuccess: () => void, isOpen: boolean) {
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
    description: ''
  });

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [workshopSettings, setWorkshopSettings] = useState<any>(null);

  // Catalog state
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && workshopId) {
      const token = localStorage.getItem('jwt_token');
      fetch(`${API_BASE_URL}/workshops/${workshopId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setWorkshopSettings(data))
      .catch(err => console.error("Error fetching workshop settings:", err));
    }
  }, [isOpen, workshopId]);

  useEffect(() => {
    if (isNewVehicle && makes.length === 0) {
      fetchMakes().then(setMakes);
    }
  }, [isNewVehicle]);

  useEffect(() => {
    if (vehicleForm.brand) {
      fetchModels(vehicleForm.brand).then(setModels);
    } else {
      setModels([]);
    }
  }, [vehicleForm.brand]);

  // API Methods
  const fetchMakes = async () => {
    const token = localStorage.getItem('jwt_token');
    const res = await fetch(`${API_BASE_URL}/vehicles/catalog/makes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  };

  const fetchModels = async (make: string) => {
    const token = localStorage.getItem('jwt_token');
    const res = await fetch(`${API_BASE_URL}/vehicles/catalog/models/${make}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  };

  const handleSearch = async (pageIdx = 0, isNewSearch = true) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    const token = localStorage.getItem('jwt_token');
    try {
      const [cRes, vRes] = await Promise.all([
        fetch(`${API_BASE_URL}/clients/search?query=${encodeURIComponent(searchQuery)}&page=${pageIdx}&size=5`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        isNewSearch ? fetch(`${API_BASE_URL}/vehicles/search?licensePlate=${searchQuery}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }) : Promise.resolve(null)
      ]);

      let newClients: ClientSearchDTO[] = [];
      if (cRes.ok) {
        const data = await cRes.json();
        newClients = data.content;
        setHasMore(!data.last);
        setCurrentPage(pageIdx);
      }

      const vehicles = (vRes && vRes.ok) ? await vRes.json() : (isNewSearch ? [] : searchResults.vehicles);

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
    
    const token = localStorage.getItem('jwt_token');
    const res = await fetch(`${API_BASE_URL}/vehicles/client/${client.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const vehicles = await res.json();
      setSearchResults(prev => ({ ...prev, vehicles }));
    }
    setStep(2);
  };

  const handleSelectVehicle = (vehicle: VehicleSearchDTO) => {
    setSelectedVehicle(vehicle);
    setStep(3);
  };

  const handleCreateClient = async () => {
    setLoading(true);
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`${API_BASE_URL}/clients/manual-register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientForm)
      });
      if (res.ok) {
        const client = await res.json();
        setSelectedClient(client);
        setStep(2);
      } else {
        const errorText = await res.text();
        alert("Error al crear cliente: " + errorText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVehicle = async () => {
    if (!selectedClient) return;
    setLoading(true);
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`${API_BASE_URL}/vehicles/register-for-client/${selectedClient.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vehicleForm)
      });
      if (res.ok) {
        const vehicle = await res.json();
        setSelectedVehicle(vehicle);
        setStep(3);
      } else {
        alert("Error al crear vehículo");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (date: string) => {
    const token = localStorage.getItem('jwt_token');
    const res = await fetch(`${API_BASE_URL}/appointments/availability/${workshopId}?date=${date}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setAvailableSlots(data.filter((s:any) => s.available).map((s:any) => s.time.slice(0,5)));
    }
  };

  const handleFinish = async () => {
    if (!selectedVehicle || !appointmentForm.date || !appointmentForm.time) return;
    setLoading(true);
    const token = localStorage.getItem('jwt_token');
    try {
      const [year, month, day] = appointmentForm.date.split('-');
      const dateTime = `${year}-${month}-${day}T${appointmentForm.time}:00`;

      const res = await fetch(`${API_BASE_URL}/appointments/staff`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workshopId,
          vehicleId: selectedVehicle.id,
          dateTime,
          serviceType: appointmentForm.serviceType,
          description: appointmentForm.description
        })
      });

      if (res.ok) {
        onSuccess();
        return true;
      } else {
        alert("Error al registrar la cita");
        return false;
      }
    } catch (err) {
      console.error(err);
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
