package org.tfg.backend.part;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentPartRepository extends JpaRepository<AppointmentPart, UUID> {
    List<AppointmentPart> findByAppointmentId(UUID appointmentId);
    Optional<AppointmentPart> findByAppointmentIdAndPartId(UUID appointmentId, UUID partId);
    List<AppointmentPart> findByPartId(UUID partId);
}
