import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

export function useWorkshopAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  });
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  });
  const [loading, setLoading] = useState(true);
  const [workshopData, setWorkshopData] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);

  const [settingsForm, setSettingsForm] = useState({
    openTime: '',
    closeTime: '',
    slotDurationMinutes: '',
    workingDays: [] as string[]
  });

  const [employeeForm, setEmployeeForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    role: 'WORKSHOP_STAFF',
    address: ''
  });

  const fetchWorkshopData = useCallback(async () => {
    const token = localStorage.getItem('jwt_token');
    const role = localStorage.getItem('role');

    if (!token) return navigate('/login');
    
    if (role !== 'WORKSHOP_OWNER' && role !== 'WORKSHOP_MANAGER') {
      alert("Acceso denegado");
      return navigate(role === 'CLIENT' ? '/client-dashboard' : '/worker-dashboard');
    }

    try {
      const res = await fetch(`${API_BASE_URL}/workshops/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setWorkshopData(data);

        let parsedDays: string[] = [];
        if (!data.workingDays || data.workingDays === 'LUNES-VIERNES') {
           parsedDays = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
        } else {
           parsedDays = data.workingDays.split(',').map((d: string) => d.trim()).filter(Boolean);
        }

        setSettingsForm({
          openTime: data.openTime || '09:00',
          closeTime: data.closeTime || '18:00',
          slotDurationMinutes: data.slotDurationMinutes || '30',
          workingDays: parsedDays
        });
      }

      // Fetch appointments
      const aRes = await fetch(`${API_BASE_URL}/appointments/workshop/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (aRes.ok) setAppointments(await aRes.json());

      // Fetch employees
      const eRes = await fetch(`${API_BASE_URL}/employees/workshop/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (eRes.ok) setEmployees(await eRes.json());
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchWorkshopData();
  }, [fetchWorkshopData]);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('jwt_token');
    try {
      const payload = {
        ...settingsForm,
        workingDays: settingsForm.workingDays.join(', ')
      };
      const res = await fetch(`${API_BASE_URL}/workshops/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Ajustes actualizados correctamente");
        fetchWorkshopData();
      }
    } catch (err) { alert("Error al guardar ajustes"); }
  };

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`${API_BASE_URL}/employees/register/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(employeeForm)
      });
      if (res.ok) {
        alert("Empleado registrado con éxito");
        setEmployeeForm({ firstname: '', lastname: '', email: '', password: '', role: 'WORKSHOP_STAFF', address: '' });
        fetchWorkshopData();
      } else {
        const error = await res.text();
        alert("Error: " + error);
      }
    } catch (err) { alert("Error de conexión"); }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!window.confirm("¿Estás seguro de eliminar este empleado? Se borrará toda su información permanentemente.")) return;
    
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Empleado eliminado");
        fetchWorkshopData();
      } else {
        alert("Error al eliminar");
      }
    } catch (err) { alert("Error de conexión"); }
  };

  const handlePromoteEmployee = async (employeeId: string) => {
    if (!window.confirm("¿Estás seguro de ascender a este empleado a Gerente? Obtendrá permisos de administración.")) return;
    
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`${API_BASE_URL}/employees/${employeeId}/promote`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Empleado ascendido correctamente");
        fetchWorkshopData();
      } else {
        const error = await res.text();
        alert("Error: " + error);
      }
    } catch (err) { alert("Error de conexión"); }
  };

  const handleDemoteEmployee = async (employeeId: string) => {
    const token = localStorage.getItem('jwt_token');
    if (!window.confirm("¿Seguro que quieres pasar a este Gerente a Mecánico de plantilla? Perderá privilegios de administración.")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/employees/${employeeId}/demote`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Operación completada");
        fetchWorkshopData();
      } else {
        const error = await res.text();
        alert("Error: " + error);
      }
    } catch (err) { alert("Error de conexión"); }
  };

  const handleAssignAppointment = async (appointmentId: string, employeeId: string | null) => {
    const token = localStorage.getItem('jwt_token');
    const url = `${API_BASE_URL}/appointments/${appointmentId}/assign` + (employeeId ? `?employeeId=${employeeId}` : '');
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchWorkshopData();
      } else {
         const errorText = await res.text();
         alert(`Error al asignar la cita: ${res.status} - ${errorText}`);
      }
    } catch (err) {
      alert(`Error de conexión: ${err}`);
    }
  };

  const handleRescheduleAppointment = async (appointmentId: string, employeeId: string | null, newDateTime: Date, duration?: number) => {
    const token = localStorage.getItem('jwt_token');
    // Para adaptarlo a la hora local de España sin perder zona, enviamos truncado:
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
        fetchWorkshopData();
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
        await fetchWorkshopData(); // Recargar datos
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
  }, [appointments, selectedDate, setSelectedDate]);

  return {
    id,
    activeTab, setActiveTab,
    selectedDate, setSelectedDate,
    viewDate, setViewDate,
    loading,
    workshopData,
    appointments,
    employees,
    isAppModalOpen, setIsAppModalOpen,
    settingsForm, setSettingsForm,
    employeeForm, setEmployeeForm,
    fetchWorkshopData,
    handleSettingsSubmit,
    handleEmployeeSubmit,
    handleDeleteEmployee,
    handlePromoteEmployee,
    handleDemoteEmployee,
    handleAssignAppointment,
    handleRescheduleAppointment,
    updateAppointmentStatus,
    goToNextPendingDate,
    goToNextUnassignedDate,
    userRole: localStorage.getItem('role')
  };
}
