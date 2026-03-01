  import { useState, useEffect, useCallback } from 'react';
  import { API_BASE_URL } from '../config/api';
  import { useNavigate } from 'react-router-dom';
  import { type UserDTO, type VehicleDTO, type AppointmentDTO, type HistoryDTO, type AppointmentRequest, type WorkshopMinDTO, type AvailableSlotDTO} from '../types/client.ts';

  export const useClientDashboard = () => {
    const navigate = useNavigate();
    
    // Estados
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserDTO | null>(null);
    const [vehicles, setVehicles] = useState<VehicleDTO[]>([]);
    const [workshops, setWorkshops] = useState<WorkshopMinDTO[]>([]);
    const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
    const [history, setHistory] = useState<HistoryDTO[]>([]);

    // Función de Carga de Datos (Memoizada con useCallback para poder reusarla)
    const loadDashboardData = useCallback(async () => {
      const token = localStorage.getItem('jwt_token');
      const role = localStorage.getItem('role');

      // 1. Seguridad básica
      if (!token || role !== 'CLIENT') {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        
        // 2. Llamadas a la API
        const [resUser, resVehicles, resWorkshops, resApps] = await Promise.all([
          fetch(`${API_BASE_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/vehicles/my-vehicles`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/workshops`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/appointments/my-appointments`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
          })
        ]);

        if (resUser.ok) setUserProfile(await resUser.json());
        if (resVehicles.ok) setVehicles(await resVehicles.json());
        if (resWorkshops.ok) setWorkshops(await resWorkshops.json());
        if (resApps.ok) {
            const data: AppointmentDTO[] = await resApps.json(); // Tipado correcto
            
            const formattedApps = data.map((app) => {
                // El backend envía "2024-10-20T10:00:00"
                const [datePart, timePart] = app.dateTime.split('T');
                
                return {
                    ...app,
                    // Asignamos los valores que esperan tus componentes visuales
                    date: datePart,
                    time: timePart ? timePart.substring(0, 5) : '', // "10:00"
                    serviceType: app.description, // Mapeamos description a serviceType
                    status: app.status || 'CONFIRMADA'
                };
            });
            setAppointments(formattedApps);
        }
        // Aquí añadirías las llamadas para appointments y history cuando existan en el backend
        setHistory([]);

      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        // Pequeño delay estético
        setTimeout(() => setLoading(false), 500);
      }
    }, [navigate]);

    // Ejecutar al montar el componente
    useEffect(() => {
      loadDashboardData();
    }, [loadDashboardData]);

    // Función de Logout
    const logout = () => {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('role');
      navigate('/login');
    };
    const registerVehicle = async (vehicleData: {
      brand: string;
      model: string;
      licensePlate: string;
      vin: string;
      year: number;
      color: string;
    }) => {
      const token = localStorage.getItem('jwt_token');
      if (!token) return false;

      try {
        const response = await fetch(`${API_BASE_URL}/vehicles/register`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(vehicleData)
        });

        if (response.ok) {
          await loadDashboardData(); // Recarga automática de la lista
          return true;
        } else {
          const errorText = await response.text();
          console.error("Error backend:", errorText);
          return false;
        }
      } catch (error) {
        console.error("Error de red:", error);
        return false;
      }
    };
    const createAppointment = async (appointmentData: AppointmentRequest) => {
      const token = localStorage.getItem('jwt_token');
      
      // Combinamos fecha y hora para que Jackson pueda convertirlo a LocalDateTime
      // Formato esperado: "YYYY-MM-DDTHH:mm:ss"
      const payload = {
        vehicleId: appointmentData.vehicleId,
        workshopId: appointmentData.workshopId,
        description: appointmentData.description,
        dateTime: `${appointmentData.date}T${appointmentData.time}:00` 
      };

      const response = await fetch(`${API_BASE_URL}/appointments`, { // Asegúrate de que la ruta sea correcta
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      return response.ok;
    };

  const getAvailableSlots = async (workshopId: string, date: string): Promise<string[]> => {
    const token = localStorage.getItem('jwt_token');
    if (!token || !workshopId || !date) return [];

    // Aseguramos que la fecha sea YYYY-MM-DD
    const formattedDate = date;

    try {
      const response = await fetch(
        `${API_BASE_URL}/appointments/availability/${workshopId}?date=${formattedDate}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const data: AvailableSlotDTO[] = await response.json();
        // El backend devuelve LocalTime, que llega como "HH:mm:ss" o "HH:mm"
        return data
          .filter(slot => slot.available)
          .map(slot => slot.time.substring(0, 5)); 
      }
      return [];
    } catch (error) {
      console.error("Error al obtener disponibilidad:", error);
      return [];
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadDashboardData(); // Refresca la lista tras eliminar
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error al eliminar la cita:", error);
      return false;
    }
  };

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
      deleteAppointment,
      logout
    };
  };

