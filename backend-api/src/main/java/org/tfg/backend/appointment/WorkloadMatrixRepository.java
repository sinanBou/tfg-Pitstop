package org.tfg.backend.appointment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface WorkloadMatrixRepository extends JpaRepository<WorkloadMatrix, UUID> {
    List<WorkloadMatrix> findByWorkshopIdAndSlotTimeBetween(UUID workshopId, LocalDateTime start, LocalDateTime end);
    List<WorkloadMatrix> findByAppointmentId(UUID appointmentId);
}
