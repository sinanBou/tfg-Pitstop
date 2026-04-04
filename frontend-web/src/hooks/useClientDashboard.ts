import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import type { 
  UserDTO, 
  VehicleDTO, 
  AppointmentDTO, 
  HistoryDTO, 
  AppointmentRequest, 
  WorkshopMinDTO, 
  AvailableSlotDTO 
} from '../types/client.ts';

// Helper local para evitar repetición en las cabeceras de autenticación
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('jwt_token');
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
};

export const useClientDashboard = () => {
  const navigate = useNavigate();
  
  // Estados centralizados
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserDTO | null>(null);
  const [vehicles, setVehicles] = useState<VehicleDTO[]>([]);
  const [workshops, setWorkshops] = useState<WorkshopMinDTO[]>([]);
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [history, setHistory] = useState<HistoryDTO[]>([]);

  // Carga de datos principales del dashboard
  const loadDashboardData = useCallback(async () => {
    const token = localStorage.getItem('jwt_token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'CLIENT') {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      
      const [resUser, resVehicles, resWorkshops, resApps] = await Promise.all([
        fetchWithAuth('/users/me'),
        fetchWithAuth('/vehicles/my-vehicles'),
        fetchWithAuth('/workshops'),
        fetchWithAuth('/appointments/my-appointments')
      ]);

      if (resUser.ok) setUserProfile(await resUser.json());
      if (resVehicles.ok) setVehicles(await resVehicles.json());
      if (resWorkshops.ok) setWorkshops(await resWorkshops.json());
      
      if (resApps.ok) {
        const data: AppointmentDTO[] = await resApps.json();
        const formattedApps = data.map((app) => {
          const [datePart, timePart] = app.dateTime.split('T');
          return {
            ...app,
            date: datePart,
            time: timePart ? timePart.substring(0, 5) : '',
            serviceType: app.serviceType || app.description,
            status: app.status || 'CONFIRMADA'
          };
        });
        setAppointments(formattedApps);
      }
      
      setHistory([]);

    } catch (error) {
      console.error("Error cargando el dashboard:", error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, [navigate]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Funciones y acciones secundarias memoizadas
  const logout = useCallback(() => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('role');
    navigate('/login');
  }, [navigate]);

  const registerVehicle = useCallback(async (vehicleData: {
    brand: string; model: string; licensePlate: string; vin: string; year: number; color: string;
  }) => {
    try {
      const response = await fetchWithAuth('/vehicles/register', {
        method: 'POST',
        body: JSON.stringify(vehicleData)
      });

      if (response.ok) {
        await loadDashboardData();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error de red registrando vehículo:", error);
      return false;
    }
  }, [loadDashboardData]);

  const createAppointment = useCallback(async (appointmentData: AppointmentRequest) => {
    const payload = {
      ...appointmentData,
      dateTime: `${appointmentData.date}T${appointmentData.time}:00` 
    };

    try {
      const response = await fetchWithAuth('/appointments', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return response.ok;
    } catch (error) {
      console.error("Error creando cita:", error);
      return false;
    }
  }, []);

  const getAvailableSlots = useCallback(async (workshopId: string, date: string): Promise<string[]> => {
    if (!workshopId || !date) return [];

    try {
      const response = await fetchWithAuth(`/appointments/availability/${workshopId}?date=${date}`);
      
      if (response.ok) {
        const data: AvailableSlotDTO[] = await response.json();
        return data
          .filter(slot => slot.available)
          .map(slot => slot.time.substring(0, 5)); 
      }
      return [];
    } catch (error) {
      console.error("Error al obtener disponibilidad:", error);
      return [];
    }
  }, []);

  const deleteAppointment = useCallback(async (appointmentId: string) => {
    try {
      const response = await fetchWithAuth(`/appointments/${appointmentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadDashboardData();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error al eliminar la cita:", error);
      return false;
    }
  }, [loadDashboardData]);

  const getCatalogMakes = useCallback(async (): Promise<string[]> => {
    try {
      const response = await fetchWithAuth('/vehicles/catalog/makes');
      if (response.ok) return await response.json();
      return [];
    } catch (error) {
      console.error("Error al obtener marcas:", error);
      return [];
    }
  }, []);

  const getCatalogModels = useCallback(async (make: string): Promise<string[]> => {
    if (!make) return [];
    try {
      const response = await fetchWithAuth(`/vehicles/catalog/models/${make}`);
      if (response.ok) return await response.json();
      return [];
    } catch (error) {
      console.error("Error al obtener modelos:", error);
      return [];
    }
  }, []);

  return {
    loading,
    userProfile,
    vehicles,
    workshops,
    appointments,
    history,
    refresh: loadDashboardData,
    registerVehicle, 
    createAppointment,
    getAvailableSlots,
    getCatalogMakes,
    getCatalogModels,
    deleteAppointment,
    logout
  };

};
