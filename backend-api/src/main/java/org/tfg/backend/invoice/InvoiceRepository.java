package org.tfg.backend.invoice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio de persistencia JPA para la entidad {@link Invoice}.
 * Facilita operaciones de búsqueda de facturas filtradas por taller o por cita.
 */
@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    /**
     * Recupera todas las facturas emitidas por un taller específico, ordenadas por fecha de creación descendente.
     *
     * @param workshopId Identificador del taller.
     * @return Lista de facturas encontradas.
     */
    List<Invoice> findByWorkshopIdOrderByCreatedAtDesc(UUID workshopId);

    /**
     * Busca la factura asociada a una cita específica.
     *
     * @param appointmentId Identificador de la cita.
     * @return Un Optional que contiene la factura encontrada, o vacío si no se encuentra.
     */
    Optional<Invoice> findByAppointmentId(UUID appointmentId);
}
