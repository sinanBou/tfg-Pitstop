package org.tfg.backend.part;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;

import java.util.List;

/**
 * Repositorio JPA para realizar operaciones de persistencia sobre la entidad WorkshopInventory.
 */
@Repository
public interface WorkshopInventoryRepository extends JpaRepository<WorkshopInventory, UUID> {
    /**
     * Busca el registro de inventario de un repuesto en un taller específico.
     *
     * @param partId Identificador único del repuesto en el catálogo.
     * @param workshopId Identificador único del taller.
     * @return Un Optional con el inventario del taller si se encuentra.
     */
    Optional<WorkshopInventory> findByPartIdAndWorkshopId(UUID partId, UUID workshopId);

    /**
     * Obtiene todos los artículos de inventario registrados para un taller específico.
     *
     * @param workshopId Identificador único del taller.
     * @return Lista de artículos en el inventario del taller.
     */
    List<WorkshopInventory> findByWorkshopId(UUID workshopId);
}
