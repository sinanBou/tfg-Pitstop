package org.tfg.backend.part;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para gestionar las operaciones de persistencia de la entidad AppointmentPart.
 */
@Repository
public interface AppointmentPartRepository extends JpaRepository<AppointmentPart, UUID> {
    /**
     * Recupera la lista de repuestos asociados a una cita específica.
     *
     * @param appointmentId Identificador único de la cita.
     * @return Lista de relaciones entre cita y repuesto.
     */
    List<AppointmentPart> findByAppointmentId(UUID appointmentId);

    /**
     * Busca la asociación de un repuesto específico con una cita específica.
     *
     * @param appointmentId Identificador único de la cita.
     * @param partId Identificador único del repuesto.
     * @return Un Optional que contiene la asociación si se encuentra.
     */
    Optional<AppointmentPart> findByAppointmentIdAndPartId(UUID appointmentId, UUID partId);

    /**
     * Busca todas las asociaciones de repuestos en citas para un repuesto específico.
     *
     * @param partId Identificador único del repuesto.
     * @return Lista de asociaciones de repuestos en citas.
     */
    List<AppointmentPart> findByPartId(UUID partId);
}