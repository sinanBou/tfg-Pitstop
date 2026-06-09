package org.tfg.backend.part;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para realizar operaciones de persistencia y consultas sobre
 * la entidad {@link AppointmentPart}.
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
     * Busca la asignación de un repuesto específico dentro de una cita determinada.
     *
     * @param appointmentId Identificador único de la cita.
     * @param partId Identificador único del repuesto.
     * @return Un contenedor opcional con la relación si existe.
     */
    Optional<AppointmentPart> findByAppointmentIdAndPartId(UUID appointmentId, UUID partId);

    /**
     * Encuentra todas las asignaciones históricas de un repuesto en cualquier cita.
     *
     * @param partId Identificador único del repuesto.
     * @return Lista de relaciones históricas.
     */
    List<AppointmentPart> findByPartId(UUID partId);
}

