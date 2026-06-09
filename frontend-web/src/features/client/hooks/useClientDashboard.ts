import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as clientService from '../services/clientService';
import type { 
  UserDTO, 
  VehicleDTO, 
  AppointmentDTO, 
  HistoryDTO, 
  AppointmentRequest, 
  WorkshopMinDTO 
} from '../types/client.types';

/**
 * Hook de control para el cuadro de mando del Cliente (Client Dashboard).
 * Expone la lógica para ver el historial de citas, citas activas,
 * registrar y consultar vehículos propios, y reservar nuevas citas.
 */
export const useClientDashboard = () => {
  const navigate = useNavigate();
  
  // Estados centralizados
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserDTO | null>(null);
  const [clientProfile, setClientProfile] = useState<any | null>(null);
  const [vehicles, setVehicles] = useState<VehicleDTO[]>([]);
  const [workshops, setWorkshops] = useState<WorkshopMinDTO[]>([]);
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [history, setHistory] = useState<HistoryDTO[]>([]);

  // Carga de datos principales del dashboard
  /**
   * Carga todo el conjunto de datos iniciales del panel del cliente:
   * perfil de usuario, información extendida de cliente, vehículos propios, talleres y citas activas/historial.
   */
  const loadDashboardData = useCallback(async () => {
    const token = localStorage.getItem('jwt_token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'CLIENT') {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      
      const [dataUser, dataClient, dataVehicles, dataWorkshops, dataApps] = await Promise.all([
        clientService.getUserProfile(),
        clientService.getClientProfile(),
        clientService.getMyVehicles(),
        clientService.getWorkshops(),
        clientService.getMyAppointments()
      ]);

      setUserProfile(dataUser);
      setClientProfile(dataClient);
      setVehicles(dataVehicles);
      setWorkshops(dataWorkshops);
      
      if (dataApps) {
        // 1. Citas Activas: PENDING, CONFIRMED, IN_PROGRESS, DELAYED + COMPLETED (para mostrar "Listo para recoger")
        const active = dataApps.filter(app => !['CANCELLED', 'PICKED_UP'].includes(app.status || 'PENDING'));
        
        // 2. Historial: CANCELLED, COMPLETED, PICKED_UP
        const historical = dataApps.filter(app => ['CANCELLED', 'COMPLETED', 'PICKED_UP'].includes(app.status || 'PENDING'));

        const sortedHistorical = [...historical].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

        setAppointments(active.map((app) => {
          const [datePart, timePart] = app.dateTime.split('T');
          return {
            ...app,
            date: datePart,
            time: timePart ? timePart.substring(0, 5) : '',
            serviceType: app.serviceType || app.description,
            status: app.status || 'PENDING'
          };
        }));

        setHistory(sortedHistorical.map(app => {
          const durationHours = (app.estimatedDuration || 0) / 60;
          const rate = app.workshopHourlyRate || 50.0;
          const cost = durationHours * rate;
          return {
            id: app.id,
            finishDate: app.dateTime.split('T')[0],
            vehicleName: app.vehicleDisplay || 'Vehículo',
            description: app.serviceType || app.description || 'Mantenimiento General',
            status: app.status || 'PENDING',
            totalCost: app.totalPrice !== undefined && app.totalPrice !== null ? app.totalPrice : cost,
            dateTime: app.dateTime,
            actualStartTime: app.actualStartTime,
            actualEndTime: app.actualEndTime,
            confirmedAt: app.confirmedAt,
            parts: app.parts,
            workshopId: app.workshopId,
            serviceType: app.serviceType
          };
        }));
      }

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
    sessionStorage.clear();
    navigate('/login');
  }, [navigate]);

  /**
   * Registra un vehículo del cliente en el taller asociado.
   * 
   * @param vehicleData Estructura del vehículo a registrar (marca, modelo, matrícula, bastidor, año, color).
   */
  const registerVehicle = useCallback(async (vehicleData: {
    brand: string; model: string; licensePlate: string; vin: string; year: number; color: string;
  }) => {
    try {
      const success = await clientService.registerVehicle(vehicleData);
      if (success) {
        await loadDashboardData();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error registrando vehículo:", error);
      return false;
    }
  }, [loadDashboardData]);

  /**
   * Registra una nueva cita para un vehículo propio en el taller y horario deseados.
   */
  const createAppointment = useCallback(async (appointmentData: AppointmentRequest) => {
    try {
      return await clientService.createAppointment(appointmentData);
    } catch (error) {
      console.error("Error creando cita:", error);
      return false;
    }
  }, []);

  /**
   * Obtiene la lista de franjas horarias disponibles para reservar cita en una fecha concreta.
   * 
   * @param workshopId ID del taller.
   * @param date Fecha a consultar en formato ISO (YYYY-MM-DD).
   * @returns Lista de horas libres disponibles formateadas como HH:MM.
   */
  const getAvailableSlots = useCallback(async (workshopId: string, date: string): Promise<string[]> => {
    try {
      return await clientService.getAvailableSlots(workshopId, date);
    } catch (error) {
      console.error("Error al obtener disponibilidad:", error);
      return [];
    }
  }, []);

  const deleteAppointment = useCallback(async (appointmentId: string) => {
    try {
      const success = await clientService.deleteAppointment(appointmentId);
      if (success) {
        await loadDashboardData();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error al eliminar la cita:", error);
      return false;
    }
  }, [loadDashboardData]);

  const deleteVehicle = useCallback(async (vehicleId: string) => {
    try {
      const success = await clientService.deleteVehicle(vehicleId);
      if (success) {
        await loadDashboardData();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error al eliminar el vehículo:", error);
      return false;
    }
  }, [loadDashboardData]);

  const getCatalogMakes = useCallback(async (): Promise<string[]> => {
    try {
      return await clientService.getCatalogMakes();
    } catch (error) {
      console.error("Error al obtener marcas:", error);
      return [];
    }
  }, []);

  const getCatalogModels = useCallback(async (make: string): Promise<string[]> => {
    try {
      return await clientService.getCatalogModels(make);
    } catch (error) {
      console.error("Error al obtener modelos:", error);
      return [];
    }
  }, []);

  /**
   * Actualiza la información del perfil del cliente (nombre, apellidos, dirección y teléfono).
   */
  const handleProfileUpdate = useCallback(async (profileData: { firstname: string; lastname: string; address: string; phoneNumber?: string }) => {
    try {
      const updated = await clientService.updateProfile(profileData);
      setClientProfile(updated);
      const dataUser = await clientService.getUserProfile();
      setUserProfile(dataUser);
      return true;
    } catch (error) {
      console.error("Error actualizando perfil del cliente:", error);
      return false;
    }
  }, []);

  return {
    loading,
    userProfile,
    clientProfile,
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
    deleteVehicle,
    logout,
    handleProfileUpdate
  };
};
