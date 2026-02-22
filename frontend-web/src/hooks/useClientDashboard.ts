  import { useState, useEffect, useCallback } from 'react';
  import { API_BASE_URL } from '../config/api';
  import { useNavigate } from 'react-router-dom';
  import { type UserDTO, type VehicleDTO, type AppointmentDTO, type HistoryDTO } from '../types/client.ts';

  export const useClientDashboard = () => {
    const navigate = useNavigate();
    
    // Estados
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserDTO | null>(null);
    const [vehicles, setVehicles] = useState<VehicleDTO[]>([]);
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
        const [resUser, resVehicles] = await Promise.all([
          fetch(`${API_BASE_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/vehicles/my-vehicles`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (resUser.ok) setUserProfile(await resUser.json());
        if (resVehicles.ok) setVehicles(await resVehicles.json());
        
        // Aquí añadirías las llamadas para appointments y history cuando existan en el backend
        setAppointments([]); 
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
        const response = await fetch(`${API_BASE_URL}/api/vehicles/register`, {
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

    return {
      loading,
      userProfile,
      vehicles,
      appointments,
      history,
      refresh: loadDashboardData,
      registerVehicle, // <--- IMPORTANTE: Exportar la función
      logout
    };
  };

