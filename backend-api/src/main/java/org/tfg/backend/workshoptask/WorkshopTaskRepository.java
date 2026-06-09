package org.tfg.backend.workshoptask;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;

/**
 * Repositorio JPA para realizar operaciones de persistencia y consultas de datos
 * sobre la entidad {@link WorkshopTask}.
 */
public interface WorkshopTaskRepository extends JpaRepository<WorkshopTask, UUID> {
    /**
     * Recupera todas las tareas asignadas a un taller específico.
     *
     * @param workshopId Identificador único del taller.
     * @return Lista de tareas asociadas al taller.
     */
    List<WorkshopTask> findByWorkshopId(UUID workshopId);

    /**
     * Recupera las tareas programadas en un taller específico en un rango de fechas determinado.
     *
     * @param workshopId Identificador único del taller.
     * @param start Fecha y hora de inicio del rango.
     * @param end Fecha y hora de fin del rango.
     * @return Lista de tareas programadas en el periodo.
     */
    List<WorkshopTask> findByWorkshopIdAndDateTimeBetween(UUID workshopId, LocalDateTime start, LocalDateTime end);

    /**
     * Recupera las tareas asignadas a un empleado (mecánico) dentro de un periodo de tiempo.
     *
     * @param employeeId Identificador único del empleado asignado.
     * @param start Fecha y hora de inicio del rango.
     * @param end Fecha y hora de fin del rango.
     * @return Lista de tareas asignadas al empleado en el periodo.
     */
    List<WorkshopTask> findByAssignedEmployeeIdAndDateTimeBetween(UUID employeeId, LocalDateTime start, LocalDateTime end);

    /**
     * Recupera las tareas originadas a partir de una cita concreta.
     *
     * @param appointmentId Identificador de la cita origen.
     * @return Lista de tareas de la cita.
     */
    List<WorkshopTask> findByOriginAppointmentId(UUID appointmentId);

    /**
     * Elimina todas las tareas asociadas a una cita origen específica.
     *
     * @param appointmentId Identificador de la cita origen.
     */
    void deleteByOriginAppointmentId(UUID appointmentId);
}

