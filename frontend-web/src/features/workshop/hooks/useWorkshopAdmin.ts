import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import * as workshopService from '../services/workshopService';
import type { EmployeeProfile, Workshop } from '../types/workshop.types';

export function useWorkshopAdmin() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
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
  const [workshopData, setWorkshopData] = useState<Workshop | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [readyForCompletion, setReadyForCompletion] = useState<any[]>([]);
  const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfile | null>(null);
  const [workshopTasks, setWorkshopTasks] = useState<any[]>([]);

  const [settingsForm, setSettingsForm] = useState({
    openTime: '',
    closeTime: '',
    slotDurationMinutes: '',
    workingDays: [] as string[],
    hourlyRate: '',
    includeOwnerInPlanning: false
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
    if (!id) return;
    const role = localStorage.getItem('role');

    if (role !== 'WORKSHOP_OWNER' && role !== 'WORKSHOP_MANAGER') {
      toast.error("Acceso denegado");
      return navigate(role === 'CLIENT' ? '/client-dashboard' : '/worker-dashboard');
    }

    try {
      const data = await workshopService.getWorkshopById(id);
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
        slotDurationMinutes: data.slotDurationMinutes ? String(data.slotDurationMinutes) : '30',
        workingDays: parsedDays,
        hourlyRate: data.hourlyRate !== undefined && data.hourlyRate !== null ? String(data.hourlyRate) : '50.0',
        includeOwnerInPlanning: data.includeOwnerInPlanning || false
      });

      // Fetch current employee profile
      const meProfile = await workshopService.getEmployeeMe();
      setEmployeeProfile(meProfile);

      // Fetch appointments
      const appData = await workshopService.getAppointmentsByWorkshop(id);
      setAppointments(appData);

      // Fetch workshop tasks for selectedDate
      const dateIso = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
      const taskData = await workshopService.getTasksByWorkshopAndDate(id, dateIso);
      setWorkshopTasks(taskData);

      // Fetch employees
      const empData = await workshopService.getEmployeesByWorkshop(id);
      setEmployees(empData);

      // Fetch appointments ready for manager sign-off
      const rcData = await workshopService.getAppointmentsReadyForCompletion(id);
      setReadyForCompletion(rcData);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, navigate, selectedDate]);

  useEffect(() => {
    fetchWorkshopData();
  }, [fetchWorkshopData]);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const payload = {
        openTime: settingsForm.openTime,
        closeTime: settingsForm.closeTime,
        slotDurationMinutes: parseInt(settingsForm.slotDurationMinutes) || 30,
        workingDays: settingsForm.workingDays.join(', '),
        hourlyRate: parseFloat(settingsForm.hourlyRate) || 50.0,
        includeOwnerInPlanning: settingsForm.includeOwnerInPlanning
      };
      await workshopService.updateWorkshopSettings(id, payload);
      toast.success("Ajustes actualizados correctamente");
      await fetchWorkshopData();
    } catch (err) { 
      console.error(err);
      toast.error("Error al guardar ajustes"); 
    }
  };

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await workshopService.registerEmployee(id, employeeForm);
      toast.success("Empleado registrado con éxito");
      setEmployeeForm({ firstname: '', lastname: '', email: '', password: '', role: 'WORKSHOP_STAFF', address: '' });
      await fetchWorkshopData();
    } catch (err: any) { 
      console.error(err);
      toast.error(err.message || "Error al registrar empleado"); 
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      await workshopService.deleteEmployee(employeeId);
      toast.success("Empleado eliminado");
      await fetchWorkshopData();
    } catch (err) { 
      console.error(err);
      toast.error("Error al eliminar"); 
    }
  };

  const handlePromoteEmployee = async (employeeId: string) => {
    try {
      await workshopService.promoteEmployee(employeeId);
      toast.success("Empleado ascendido correctamente");
      await fetchWorkshopData();
    } catch (err) { 
      console.error(err);
      toast.error("Error al ascender"); 
    }
  };

  const handleDemoteEmployee = async (employeeId: string) => {
    try {
      await workshopService.demoteEmployee(employeeId);
      toast.success("Operación completada");
      await fetchWorkshopData();
    } catch (err) { 
      console.error(err);
      toast.error("Error al degradar cargo"); 
    }
  };

  const handleAssignAppointment = async (appointmentId: string, employeeId: string | null) => {
    try {
      await workshopService.assignAppointment(appointmentId, employeeId);
      await fetchWorkshopData();
    } catch (err) {
      console.error(err);
      toast.error(`Error al asignar la cita: ${err}`);
    }
  };

  const handleRescheduleAppointment = async (appointmentId: string, employeeId: string | null, newDateTime: Date, duration?: number) => {
    const localIso = new Date(newDateTime.getTime() - newDateTime.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
    try {
      await workshopService.rescheduleAppointment(appointmentId, employeeId, localIso, duration);
      await fetchWorkshopData();
    } catch (err) {
      console.error(err);
      toast.error(`Error al reubicar: ${err}`);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    // Optimistic UI update
    setAppointments(prev => prev.filter(app => app.id !== appointmentId));
    try {
      await workshopService.deleteAppointment(appointmentId);
      await fetchWorkshopData();
      return true;
    } catch (err) {
      console.error("Error eliminando cita:", err);
      await fetchWorkshopData();
    }
    return false;
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await workshopService.updateTaskStatus(taskId, newStatus);
      await fetchWorkshopData();
      return true;
    } catch (err) {
      console.error("Error actualizando estado tarea:", err);
    }
    return false;
  };

  const handleRescheduleTask = async (taskId: string, employeeId: string | null, newDateTime: Date, duration?: number) => {
    const localIso = new Date(newDateTime.getTime() - newDateTime.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
    try {
      await workshopService.rescheduleTask(taskId, {
        dateTime: localIso,
        assignedEmployeeId: employeeId,
        estimatedDuration: duration,
        reassignEmployee: true
      });
      await fetchWorkshopData();
    } catch (err) {
      console.error(err);
      toast.error(`Error al reubicar tarea: ${err}`);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await workshopService.deleteTask(taskId);
      await fetchWorkshopData();
      return true;
    } catch (err) {
      console.error("Error eliminando tarea:", err);
    }
    return false;
  };

  const updateAppointmentStatus = async (id: string, newStatus: string) => {
    try {
      await workshopService.updateAppointmentStatus(id, newStatus);
      await fetchWorkshopData(); // Recargar datos
      return true;
    } catch (err) {
      console.error("Error actualizando estado:", err);
    }
    return false;
  };

  const completeJob = async (appointmentId: string) => {
    try {
      await workshopService.updateAppointmentStatus(appointmentId, 'COMPLETED');
      await fetchWorkshopData();
      return true;
    } catch (err) {
      console.error("Error completando trabajo:", err);
    }
    return false;
  };

  const markPickedUp = async (appointmentId: string) => {
    try {
      await workshopService.updateAppointmentStatus(appointmentId, 'PICKED_UP');
      await fetchWorkshopData();
      return true;
    } catch (err) {
      console.error("Error marcando recogida:", err);
    }
    return false;
  };

  const checkInVehicle = async (appointmentId: string, kilometers: number, notes: string) => {
    try {
      await workshopService.checkInVehicle(appointmentId, kilometers, notes);
      await fetchWorkshopData();
      return true;
    } catch (err) {
      console.error("Error al recepcionar el vehículo:", err);
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
      toast.info("No hay más citas sin asignar en los próximos días.");
    }
  }, [appointments, selectedDate, toast]);

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
      toast.info("No hay más citas pendientes en los próximos días.");
    }
  }, [appointments, selectedDate, toast]);

  const handleProfileUpdate = async (profileData: { firstname: string; lastname: string; address: string }) => {
    try {
      const updated = await workshopService.updateEmployeeMe(profileData);
      setEmployeeProfile(updated);
      await fetchWorkshopData();
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      toast.error('Error al actualizar el perfil');
    }
  };

  const handleUploadAvatar = async (file: File) => {
    try {
      const updated = await workshopService.uploadAvatar(file);
      setEmployeeProfile(updated);
      await fetchWorkshopData();
      return true;
    } catch (err) {
      console.error('Error al subir la foto de perfil:', err);
    }
    return false;
  };

  const handleDeleteAvatar = async () => {
    try {
      const updated = await workshopService.deleteAvatar();
      setEmployeeProfile(updated);
      await fetchWorkshopData();
      return true;
    } catch (err) {
      console.error('Error al eliminar la foto de perfil:', err);
    }
    return false;
  };

  const handleUploadWorkshopLogo = async (file: File) => {
    if (!id) return false;
    try {
      const updated = await workshopService.uploadWorkshopLogo(id, file);
      setWorkshopData(updated);
      return true;
    } catch (err) {
      console.error('Error al subir el logo del taller:', err);
    }
    return false;
  };

  const handleDeleteWorkshopLogo = async () => {
    if (!id) return false;
    try {
      const updated = await workshopService.deleteWorkshopLogo(id);
      setWorkshopData(updated);
      return true;
    } catch (err) {
      console.error('Error al eliminar el logo del taller:', err);
    }
    return false;
  };

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
    updateTaskStatus,
    handleRescheduleTask,
    handleDeleteTask,
    completeJob,
    markPickedUp,
    checkInVehicle,
    readyForCompletion,

    goToNextPendingDate,
    goToNextUnassignedDate,
    handleDeleteAppointment,
    employeeProfile,
    workshopTasks,
    handleProfileUpdate,
    handleUploadAvatar,
    handleDeleteAvatar,
    handleUploadWorkshopLogo,
    handleDeleteWorkshopLogo,
    userRole: localStorage.getItem('role')
  };
}
