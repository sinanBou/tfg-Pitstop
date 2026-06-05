package org.tfg.backend.workshoptask;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;

public interface WorkshopTaskRepository extends JpaRepository<WorkshopTask, UUID> {
    List<WorkshopTask> findByWorkshopId(UUID workshopId);
    List<WorkshopTask> findByWorkshopIdAndDateTimeBetween(UUID workshopId, LocalDateTime start, LocalDateTime end);
    List<WorkshopTask> findByAssignedEmployeeIdAndDateTimeBetween(UUID employeeId, LocalDateTime start, LocalDateTime end);
    List<WorkshopTask> findByAssignedEmployeeId(UUID employeeId);
    List<WorkshopTask> findByOriginAppointmentId(UUID appointmentId);
    void deleteByOriginAppointmentId(UUID appointmentId);
}
