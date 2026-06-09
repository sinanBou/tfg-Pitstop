package org.tfg.backend.workshoptask;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Controlador REST que expone los endpoints de la API para la gestión de tareas de taller,
 * permitiendo consultar las tareas programadas para un taller en un día concreto, actualizar
 * su progreso o reasignar empleados, y eliminar o cancelar tareas asignadas.
 */
@RestController
@RequestMapping("/api/workshop-tasks")
@RequiredArgsConstructor
public class WorkshopTaskController {
    private final WorkshopTaskService taskService;

    /**
     * Obtiene la lista de tareas programadas para un taller en un día específico.
     *
     * @param workshopId Identificador único del taller.
     * @param date Fecha para filtrar las tareas.
     * @return Lista de tareas programadas (tanto asignadas a mecánicos como pendientes).
     */
    @GetMapping("/workshop/{workshopId}")
    public List<WorkshopTaskDTO> getWorkshopTasks(
            @PathVariable UUID workshopId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);
        return taskService.getTasksByWorkshopAndDate(workshopId, start, end);
    }

    /**
     * Actualiza el progreso, duración estimada o la asignación de mecánico de una tarea existente.
     *
     * @param id Identificador único de la tarea.
     * @param dto DTO con los campos actualizados.
     * @return El DTO de la tarea modificada.
     */
    @PatchMapping("/{id}")
    public ResponseEntity<WorkshopTaskDTO> updateTask(@PathVariable UUID id, @RequestBody WorkshopTaskDTO dto) {
        return ResponseEntity.ok(taskService.updateTask(id, dto));
    }

    /**
     * Elimina o cancela una tarea según las reglas de negocio (dependiendo de si la cita
     * origen está dividida en varias tareas o no).
     *
     * @param id Identificador único de la tarea a eliminar.
     * @return Respuesta HTTP vacía indicando éxito.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok().build();
    }
}
