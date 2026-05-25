package org.tfg.backend.workshoptask;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkshopTaskService {
    private final WorkshopTaskRepository taskRepository;
    private final org.tfg.backend.employee.EmployeeRepository employeeRepository;
    private final org.tfg.backend.appointment.AppointmentRepository appointmentRepository;

    public List<WorkshopTaskDTO> getTasksByWorkshopAndDate(UUID workshopId, LocalDateTime start, LocalDateTime end) {
        List<WorkshopTask> list = new java.util.ArrayList<>(taskRepository.findByWorkshopIdAndDateTimeBetween(workshopId, start, end));
        List<WorkshopTask> allTasks = taskRepository.findByWorkshopId(workshopId);
        
        java.util.Set<UUID> existingIds = list.stream().map(WorkshopTask::getId).collect(Collectors.toSet());
        
        for (WorkshopTask t : allTasks) {
            if (t.getAssignedEmployee() == null && 
                t.getStatus() != WorkshopTaskStatus.COMPLETED && 
                t.getStatus() != WorkshopTaskStatus.CANCELLED) {
                if (!existingIds.contains(t.getId())) {
                    list.add(t);
                    existingIds.add(t.getId());
                }
            }
        }
        
        return list.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<WorkshopTaskDTO> getTasksByEmployeeAndDate(UUID employeeId, LocalDateTime start, LocalDateTime end) {
        return taskRepository.findByAssignedEmployeeIdAndDateTimeBetween(employeeId, start, end)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkshopTaskDTO updateTask(UUID taskId, WorkshopTaskDTO dto) {
        WorkshopTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));
        
        if (dto.getDateTime() != null) task.setDateTime(dto.getDateTime());
        if (dto.getStatus() != null) task.setStatus(dto.getStatus());
        if (dto.getEstimatedDuration() != null) task.setEstimatedDuration(dto.getEstimatedDuration());
        if (dto.getCompletedTasks() != null) task.setCompletedTasks(dto.getCompletedTasks());
        
        // Only modify employee assignment when explicitly requested via flag
        if (Boolean.TRUE.equals(dto.getReassignEmployee())) {
            if (dto.getAssignedEmployeeId() != null) {
                task.setAssignedEmployee(employeeRepository.findById(dto.getAssignedEmployeeId()).orElse(null));
            } else {
                task.setAssignedEmployee(null);
            }
        }
        
        return convertToDTO(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(UUID taskId) {
        WorkshopTask task = taskRepository.findById(taskId).orElse(null);
        if (task != null) {
            org.tfg.backend.appointment.Appointment origin = task.getOriginAppointment();
            
            // Si tiene una cita origen, vemos cuántas tareas activas (no canceladas) tiene esa cita
            long activeTasksCount = 0;
            if (origin != null && origin.getTasks() != null) {
                activeTasksCount = origin.getTasks().stream()
                        .filter(t -> t.getStatus() != WorkshopTaskStatus.CANCELLED)
                        .count();
            }

            if (activeTasksCount > 1) {
                // "si esta dividida que se cancele la tarea ese period del dia"
                task.setStatus(WorkshopTaskStatus.CANCELLED);
                taskRepository.save(task);
            } else {
                // "si esta en solo un dia que se elimine la tarea por completa y vuelva la cita a sin asignar"
                if (origin != null && origin.getTasks() != null) {
                    origin.getTasks().remove(task);
                }
                taskRepository.delete(task);
                
                if (origin != null) {
                    origin.setAssignedEmployee(null); // Vuelve la cita a sin asignar (unassigned)
                    origin.setStatus(org.tfg.backend.appointment.AppointmentStatus.CONFIRMED); // Vuelve a estado confirmado pero sin asignar
                    appointmentRepository.save(origin);
                }
            }
        }
    }

    public WorkshopTaskDTO convertToDTO(WorkshopTask task) {
        return WorkshopTaskDTO.builder()
                .id(task.getId())
                .dateTime(task.getDateTime())
                .description(task.getDescription())
                .serviceType(task.getServiceType())
                .status(task.getStatus())
                .estimatedDuration(task.getEstimatedDuration())
                .actualStartTime(task.getActualStartTime())
                .actualEndTime(task.getActualEndTime())
                .vehicleId(task.getVehicle() != null ? task.getVehicle().getId() : null)
                .vehicleDisplay(task.getVehicle() != null ? task.getVehicle().getBrand() + " " + task.getVehicle().getModel() + " (" + task.getVehicle().getLicensePlate() + ")" : "N/A")
                .workshopId(task.getWorkshop() != null ? task.getWorkshop().getId() : null)
                .workshopName(task.getWorkshop() != null ? task.getWorkshop().getCompanyName() : "N/A")
                .assignedEmployeeId(task.getAssignedEmployee() != null ? task.getAssignedEmployee().getId() : null)
                .assignedEmployeeName(task.getAssignedEmployee() != null && task.getAssignedEmployee().getUser() != null ? task.getAssignedEmployee().getUser().getFirstname() + " " + task.getAssignedEmployee().getUser().getLastname() : null)
                .clientFullName(task.getOriginAppointment() != null && task.getOriginAppointment().getClient() != null && task.getOriginAppointment().getClient().getUser() != null ? task.getOriginAppointment().getClient().getUser().getFirstname() + " " + task.getOriginAppointment().getClient().getUser().getLastname() : "N/A")
                .originAppointmentId(task.getOriginAppointment() != null ? task.getOriginAppointment().getId() : null)
                .completedTasks(task.getCompletedTasks())
                .mechanicComments(task.getOriginAppointment() != null ? task.getOriginAppointment().getMechanicComments() : null)
                .isTask(true)
                .build();
    }
}
