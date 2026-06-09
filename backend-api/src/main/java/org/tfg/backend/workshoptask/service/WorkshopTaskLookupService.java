package org.tfg.backend.workshoptask.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.workshoptask.*;
import org.tfg.backend.workshoptask.mapper.WorkshopTaskMapper;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servicio encargado de realizar consultas y lecturas de tareas de taller por taller o por empleado.
 * Todas sus operaciones se ejecutan bajo transacciones de sólo lectura para optimizar el rendimiento de la aplicación.
 */
@Service
@RequiredArgsConstructor
public class WorkshopTaskLookupService {

    private final WorkshopTaskRepository taskRepository;
    private final WorkshopTaskMapper taskMapper;

    /**
     * Recupera las tareas programadas para un taller en un rango de fecha determinado, agregando aquellas tareas
     * huérfanas sin mecánico asignado para facilitar su visibilidad.
     *
     * @param workshopId Identificador único del taller.
     * @param start Fecha inicial.
     * @param end Fecha límite.
     * @return Lista de tareas programadas mapeadas a DTOs.
     */
    @Transactional(readOnly = true)
    public List<WorkshopTaskDTO> getTasksByWorkshopAndDate(UUID workshopId, LocalDateTime start, LocalDateTime end) {
        List<WorkshopTask> list = new ArrayList<>(taskRepository.findByWorkshopIdAndDateTimeBetween(workshopId, start, end));
        List<WorkshopTask> allTasks = taskRepository.findByWorkshopId(workshopId);

        Set<UUID> existingIds = list.stream().map(WorkshopTask::getId).collect(Collectors.toSet());

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
                .map(taskMapper::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Recupera todas las tareas asignadas a un mecánico específico en un rango de fechas.
     *
     * @param employeeId Identificador único del mecánico (empleado).
     * @param start Fecha inicial.
     * @param end Fecha límite.
     * @return Lista de tareas asignadas.
     */
    @Transactional(readOnly = true)
    public List<WorkshopTaskDTO> getTasksByEmployeeAndDate(UUID employeeId, LocalDateTime start, LocalDateTime end) {
        return taskRepository.findByAssignedEmployeeIdAndDateTimeBetween(employeeId, start, end)
                .stream()
                .map(taskMapper::convertToDTO)
                .collect(Collectors.toList());
    }
}
