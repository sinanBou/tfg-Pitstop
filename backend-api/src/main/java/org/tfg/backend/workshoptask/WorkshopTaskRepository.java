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
    List<WorkshopTask> findByWorkshopId(UUID workshopId);
    List<WorkshopTask> findByWorkshopIdAndStatus(UUID workshopId, WorkshopTaskStatus status);
    List<WorkshopTask> findByWorkshopIdAndDateTimeBetween(UUID workshopId, LocalDateTime start, LocalDateTime end);
    List<WorkshopTask> findByAssignedEmployeeIdAndDateTimeBetween(UUID employeeId, LocalDateTime start, LocalDateTime end);
    List<WorkshopTask> findByAssignedEmployeeId(UUID employeeId);
    /**
    * Recupera las tareas originadas a partir de una cita concreta.
    *
    * @param appointmentId Identificador de la cita origen.
    * @return Lista de tareas de la cita.
    */
    List<WorkshopTask> findByOriginAppointmentId(UUID appointmentId);
    void deleteByOriginAppointmentId(UUID appointmentId);
}