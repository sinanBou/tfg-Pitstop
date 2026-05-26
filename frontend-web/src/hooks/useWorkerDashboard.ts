import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

export function useWorkerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employeeProfile, setEmployeeProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [workshopTasks, setWorkshopTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [workshopData, setWorkshopData] = useState<any>(null);
  const [readyForCompletion, setReadyForCompletion] = useState<any[]>([]);
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
        
        const dateIso = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
        const taskRes = await fetch(`${API_BASE_URL}/workshop-tasks/workshop/${data.workshopId}?date=${dateIso}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(taskRes.ok) setWorkshopTasks(await taskRes.json());

        const empRes = await fetch(`${API_BASE_URL}/employees/workshop/${data.workshopId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(empRes.ok) setEmployees(await empRes.json());

        // Fetch workshop settings
        const wsRes = await fetch(`${API_BASE_URL}/workshops/${data.workshopId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (wsRes.ok) setWorkshopData(await wsRes.json());

        // Fetch completed jobs for manager panel
        const rcRes = await fetch(`${API_BASE_URL}/appointments/workshop/${data.workshopId}/ready-for-completion`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(rcRes.ok) setReadyForCompletion(await rcRes.json());
      }
    } catch (err) {
      localStorage.clear();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate, selectedDate]);

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

  const updateTaskStatus = async (id: string, newStatus: string) => {
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`${API_BASE_URL}/workshop-tasks/${id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        await fetchWorkerData();
        return true;
      }
    } catch (err) {
      console.error("Error actualizando estado tarea:", err);
    }
    return false;
  };

  const handleRescheduleTask = async (taskId: string, employeeId: string | null, newDateTime: Date, duration?: number) => {
    const token = localStorage.getItem('jwt_token');
    const localIso = new Date(newDateTime.getTime() - newDateTime.getTimezoneOffset() * 60000).toISOString().slice(0, 19);

    try {
      const res = await fetch(`${API_BASE_URL}/workshop-tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dateTime: localIso,
          assignedEmployeeId: employeeId,
          estimatedDuration: duration,
          reassignEmployee: true
        })
      });
      if (res.ok) {
        fetchWorkerData();
      } else {
        const errorText = await res.text();
        alert(`Error al reubicar tarea: ${res.status} - ${errorText}`);
      }
    } catch (err) {
      alert(`Error de conexión: ${err}`);
    }
  };

  /** Mark a job as fully completed — client sees it as ready to pick up */
  const completeJob = async (appointmentId: string) => {
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/status?status=COMPLETED`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchWorkerData();
        return true;
      }
    } catch (err) {
      console.error("Error completando trabajo:", err);
    }
    return false;
  };

  /** Mark vehicle as picked up by the client — removed from all panels */
  const markPickedUp = async (appointmentId: string) => {
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/status?status=PICKED_UP`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchWorkerData();
        return true;
      }
    } catch (err) {
      console.error("Error marcando recogida:", err);
    }
    return false;
  };

  /** Check-in vehicle (register kilometers and notes) */
  const checkInVehicle = async (appointmentId: string, kilometers: number, notes: string) => {
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/check-in?kilometers=${kilometers}&notes=${encodeURIComponent(notes)}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchWorkerData();
        return true;
      }
    } catch (err) {
      console.error("Error al recepcionar el vehículo:", err);
    }
    return false;
  };


  const handleDeleteTask = async (taskId: string) => {
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`${API_BASE_URL}/workshop-tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchWorkerData();
        return true;
      }
    } catch (err) {
      console.error("Error eliminando tarea:", err);
    }
    return false;
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    const token = localStorage.getItem('jwt_token');
    
    // Optimistic UI update
    setAppointments(prev => prev.filter(app => app.id !== appointmentId));
    
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchWorkerData();
        return true;
      } else {
        // Revert on failure
        await fetchWorkerData();
      }
    } catch (err) {
      console.error("Error eliminando cita:", err);
      // Revert on failure
      await fetchWorkerData();
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

  const handleProfileUpdate = async (profileData: { firstname: string; lastname: string; address: string }) => {
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`${API_BASE_URL}/employees/me`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        const updated = await res.json();
        setEmployeeProfile(updated);
      } else {
        alert('Error al actualizar el perfil');
      }
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      alert('Error de conexión al actualizar el perfil');
    }
  };

  const handleUploadAvatar = async (file: File) => {
    const token = localStorage.getItem('jwt_token');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API_BASE_URL}/employees/me/avatar`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (res.ok) {
        const updated = await res.json();
        setEmployeeProfile(updated);
        await fetchWorkerData();
        return true;
      }
    } catch (err) {
      console.error('Error al subir la foto de perfil:', err);
    }
    return false;
  };

  const handleDeleteAvatar = async () => {
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`${API_BASE_URL}/employees/me/avatar`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const updated = await res.json();
        setEmployeeProfile(updated);
        await fetchWorkerData();
        return true;
      }
    } catch (err) {
      console.error('Error al eliminar la foto de perfil:', err);
    }
    return false;
  };

  return {
    loading,
    employeeProfile,
    appointments,
    workshopTasks,
    employees,
    fetchWorkerData,
    updateAppointmentStatus,
    updateTaskStatus,
    handleAssignAppointment,
    handleRescheduleAppointment,
    handleRescheduleTask,
    handleDeleteTask,
    handleDeleteAppointment,
    selectedDate,
    setSelectedDate,
    goToNextPendingDate,
    goToNextUnassignedDate,
    readyForCompletion,
    completeJob,
    markPickedUp,
    checkInVehicle,
    workshopData,

    handleProfileUpdate,
    handleUploadAvatar,
    handleDeleteAvatar
  };
}
