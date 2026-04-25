import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

export function useWorkerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employeeProfile, setEmployeeProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  });

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
        
        const empRes = await fetch(`${API_BASE_URL}/employees/workshop/${data.workshopId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(empRes.ok) setEmployees(await empRes.json());
      }
    } catch (err) {
      localStorage.clear();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleAssignAppointment = async (appointmentId: string, employeeId: string | null) => {
    const token = localStorage.getItem('jwt_token');
    const url = `${API_BASE_URL}/appointments/${appointmentId}/assign` + (employeeId ? `?employeeId=${employeeId}` : '');
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchWorkerData();
      } else {
        const errorText = await res.text();
        alert(`Error al asignar la cita: ${res.status} - ${errorText}`);
      }
    } catch (err) {
      console.error(err);
      alert(`Error de conexión: ${err}`);
    }
  };

  const handleRescheduleAppointment = async (appointmentId: string, employeeId: string | null, newDateTime: Date, duration?: number) => {
    const token = localStorage.getItem('jwt_token');
    // Para adaptarlo a la hora local sin perder zona, enviamos truncado:
    const localIso = new Date(newDateTime.getTime() - newDateTime.getTimezoneOffset() * 60000).toISOString().slice(0, 19);

    const url = `${API_BASE_URL}/appointments/${appointmentId}/reschedule?dateTime=${localIso}` + 
                (employeeId ? `&employeeId=${employeeId}` : '') +
                (duration ? `&duration=${duration}` : '');
    
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchWorkerData();
      } else {
        const errorText = await res.text();
        alert(`Error al reubicar: ${res.status} - ${errorText}`);
      }
    } catch (err) {
      alert(`Error de conexión: ${err}`);
    }
  };

  const updateAppointmentStatus = async (id: string, newStatus: string) => {
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${id}/status?status=${newStatus}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchWorkerData(); // Recargar datos
        return true;
      }
    } catch (err) {
      console.error("Error actualizando estado:", err);
    }
    return false;
  };

  const goToNextUnassignedDate = useCallback(() => {
    if (!appointments.length) return;

    const futureUnassigned = appointments
      .filter(app => {
        const appDate = new Date(app.dateTime);
        const currentSelected = new Date(selectedDate);
        appDate.setHours(0,0,0,0);
        currentSelected.setHours(0,0,0,0);
        
        return app.status !== 'PENDING' && !app.assignedEmployeeId && appDate > currentSelected;
      })
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

    if (futureUnassigned.length > 0) {
      const nextDate = new Date(futureUnassigned[0].dateTime);
      nextDate.setHours(0,0,0,0);
      setSelectedDate(nextDate);
    } else {
      alert("No hay más citas sin asignar en los próximos días.");
    }
  }, [appointments, selectedDate]);

  const goToNextPendingDate = useCallback(() => {
    if (!appointments.length) return;

    const futurePending = appointments
      .filter(app => {
        const appDate = new Date(app.dateTime);
        const currentSelected = new Date(selectedDate);
        appDate.setHours(0,0,0,0);
        currentSelected.setHours(0,0,0,0);
        
        return app.status === 'PENDING' && appDate > currentSelected;
      })
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

    if (futurePending.length > 0) {
      const nextDate = new Date(futurePending[0].dateTime);
      nextDate.setHours(0,0,0,0);
      setSelectedDate(nextDate);
    } else {
      alert("No hay más citas pendientes en los próximos días.");
    }
  }, [appointments, selectedDate]);

  useEffect(() => {
    fetchWorkerData();
  }, [fetchWorkerData]);

  return {
    loading,
    employeeProfile,
    appointments,
    employees,
    fetchWorkerData,
    updateAppointmentStatus,
    handleAssignAppointment,
    handleRescheduleAppointment,
    selectedDate,
    setSelectedDate,
    goToNextPendingDate,
    goToNextUnassignedDate
  };
}
