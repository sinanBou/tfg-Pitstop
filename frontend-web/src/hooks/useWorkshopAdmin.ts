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
  const [showCalendar, setShowCalendar] = useState(false);

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

  return {
    id,
    activeTab, setActiveTab,
    selectedDate, setSelectedDate,
    viewDate, setViewDate,
    showCalendar, setShowCalendar,
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
    handleDeleteEmployee
  };
}
