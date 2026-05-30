import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as workshopService from '../services/workshopService';
import type { EmployeeProfile, Workshop } from '../types/workshop.types';

export function useWorkerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfile | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [workshopTasks, setWorkshopTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [workshopData, setWorkshopData] = useState<Workshop | null>(null);
  const [readyForCompletion, setReadyForCompletion] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  });

  const fetchWorkerData = useCallback(async () => {
    try {
      const data = await workshopService.getEmployeeMe();
      setEmployeeProfile(data);

      if (data.workshopId) {
        const appData = await workshopService.getAppointmentsByWorkshop(data.workshopId);
        setAppointments(appData);
        
        const dateIso = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
        const taskData = await workshopService.getTasksByWorkshopAndDate(data.workshopId, dateIso);
        setWorkshopTasks(taskData);

        const empData = await workshopService.getEmployeesByWorkshop(data.workshopId);
        setEmployees(empData);

        // Fetch workshop settings
        const wsData = await workshopService.getWorkshopById(data.workshopId);
        setWorkshopData(wsData);

        // Fetch completed jobs for manager panel
        const rcData = await workshopService.getAppointmentsReadyForCompletion(data.workshopId);
        setReadyForCompletion(rcData);
      }
    } catch (err) {
      localStorage.clear();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate, selectedDate]);

  const handleAssignAppointment = async (appointmentId: string, employeeId: string | null) => {
    try {
      await workshopService.assignAppointment(appointmentId, employeeId);
      await fetchWorkerData();
    } catch (err) {
      console.error(err);
      alert(`Error al asignar la cita: ${err}`);
    }
  };

  const handleRescheduleAppointment = async (appointmentId: string, employeeId: string | null, newDateTime: Date, duration?: number) => {
    // Para adaptarlo a la hora local sin perder zona, enviamos truncado:
    const localIso = new Date(newDateTime.getTime() - newDateTime.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
    try {
      await workshopService.rescheduleAppointment(appointmentId, employeeId, localIso, duration);
      await fetchWorkerData();
    } catch (err) {
      console.error(err);
      alert(`Error al reubicar: ${err}`);
    }
  };

  const updateAppointmentStatus = async (id: string, newStatus: string) => {
    try {
      await workshopService.updateAppointmentStatus(id, newStatus);
      await fetchWorkerData(); // Recargar datos
      return true;
    } catch (err) {
      console.error("Error actualizando estado:", err);
    }
    return false;
  };

  const updateTaskStatus = async (id: string, newStatus: string) => {
    try {
      await workshopService.updateTaskStatus(id, newStatus);
      await fetchWorkerData();
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
      await fetchWorkerData();
    } catch (err) {
      console.error(err);
      alert(`Error al reubicar tarea: ${err}`);
    }
  };

  /** Mark a job as fully completed — client sees it as ready to pick up */
  const completeJob = async (appointmentId: string) => {
    try {
      await workshopService.updateAppointmentStatus(appointmentId, 'COMPLETED');
      await fetchWorkerData();
      return true;
    } catch (err) {
      console.error("Error completando trabajo:", err);
    }
    return false;
  };

  /** Mark vehicle as picked up by the client — removed from all panels */
  const markPickedUp = async (appointmentId: string) => {
    try {
      await workshopService.updateAppointmentStatus(appointmentId, 'PICKED_UP');
      await fetchWorkerData();
      return true;
    } catch (err) {
      console.error("Error marcando recogida:", err);
    }
    return false;
  };

  /** Check-in vehicle (register kilometers and notes) */
  const checkInVehicle = async (appointmentId: string, kilometers: number, notes: string) => {
    try {
      await workshopService.checkInVehicle(appointmentId, kilometers, notes);
      await fetchWorkerData();
      return true;
    } catch (err) {
      console.error("Error al recepcionar el vehículo:", err);
    }
    return false;
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await workshopService.deleteTask(taskId);
      await fetchWorkerData();
      return true;
    } catch (err) {
      console.error("Error eliminando tarea:", err);
    }
    return false;
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    // Optimistic UI update
    setAppointments(prev => prev.filter(app => app.id !== appointmentId));
    try {
      await workshopService.deleteAppointment(appointmentId);
      await fetchWorkerData();
      return true;
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
    try {
      const updated = await workshopService.updateEmployeeMe(profileData);
      setEmployeeProfile(updated);
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      alert('Error al actualizar el perfil');
    }
  };

  const handleUploadAvatar = async (file: File) => {
    try {
      const updated = await workshopService.uploadAvatar(file);
      setEmployeeProfile(updated);
      await fetchWorkerData();
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
      await fetchWorkerData();
      return true;
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
