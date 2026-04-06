import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

export function useWorkerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employeeProfile, setEmployeeProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);

  const fetchWorkerData = useCallback(async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return navigate('/login');

    try {
      const res = await fetch(`${API_BASE_URL}/employees/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("No autenticado");
      const data = await res.json();
      setEmployeeProfile(data);

      if (data.workshopId) {
        const appRes = await fetch(`${API_BASE_URL}/appointments/workshop/${data.workshopId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(appRes.ok) setAppointments(await appRes.json());
      }
    } catch (err) {
      localStorage.clear();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchWorkerData();
  }, [fetchWorkerData]);

  return {
    loading,
    employeeProfile,
    appointments,
    fetchWorkerData
  };
}
