package org.tfg.backend.invoice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    /**
    * Recupera todas las facturas emitidas por un taller especÃ­fico, ordenadas por fecha de creaciÃ³n descendente.
    *
    * @param workshopId Identificador del taller.
    * @return Lista de facturas encontradas.
    */
    List<Invoice> findByWorkshopIdOrderByCreatedAtDesc(UUID workshopId);
    Optional<Invoice> findByAppointmentId(UUID appointmentId);
}