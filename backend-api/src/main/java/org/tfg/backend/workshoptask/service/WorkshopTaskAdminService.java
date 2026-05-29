package org.tfg.backend.workshoptask.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.employee.EmployeeRepository;
import org.tfg.backend.appointment.AppointmentRepository;
import org.tfg.backend.workshoptask.*;
import org.tfg.backend.workshoptask.mapper.WorkshopTaskMapper;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkshopTaskAdminService {

    private final WorkshopTaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;
    private final AppointmentRepository appointmentRepository;
    private final WorkshopTaskMapper taskMapper;

    @Transactional
    public WorkshopTaskDTO updateTask(UUID taskId, WorkshopTaskDTO dto) {
        WorkshopTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        if (dto.getDateTime() != null) task.setDateTime(dto.getDateTime());
        if (dto.getStatus() != null) task.setStatus(dto.getStatus());
        if (dto.getEstimatedDuration() != null) task.setEstimatedDuration(dto.getEstimatedDuration());
        if (dto.getCompletedTasks() != null) task.setCompletedTasks(dto.getCompletedTasks());

        if (Boolean.TRUE.equals(dto.getReassignEmployee())) {
            if (dto.getAssignedEmployeeId() != null) {
                task.setAssignedEmployee(employeeRepository.findById(dto.getAssignedEmployeeId()).orElse(null));
            } else {
                task.setAssignedEmployee(null);
            }
        }

        return taskMapper.convertToDTO(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(UUID taskId) {
        WorkshopTask task = taskRepository.findById(taskId).orElse(null);
        if (task != null) {
            org.tfg.backend.appointment.Appointment origin = task.getOriginAppointment();

            long activeTasksCount = 0;
            if (origin != null && origin.getTasks() != null) {
                activeTasksCount = origin.getTasks().stream()
                        .filter(t -> t.getStatus() != WorkshopTaskStatus.CANCELLED)
                        .count();
            }

            if (activeTasksCount > 1) {
                task.setStatus(WorkshopTaskStatus.CANCELLED);
                taskRepository.save(task);
            } else {
                if (origin != null && origin.getTasks() != null) {
                    origin.getTasks().remove(task);
                }
                taskRepository.delete(task);

                if (origin != null) {
                    origin.setAssignedEmployee(null);
                    origin.setStatus(org.tfg.backend.appointment.AppointmentStatus.CONFIRMED);
                    appointmentRepository.save(origin);
                }
            }
        }
    }
}
