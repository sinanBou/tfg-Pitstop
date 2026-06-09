package org.tfg.backend.part;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;

/**
 * Repositorio JPA para gestionar las operaciones de persistencia e inventario
 * del almacén {@link WorkshopInventory}.
 */
@Repository
public interface WorkshopInventoryRepository extends JpaRepository<WorkshopInventory, UUID> {
    /**
     * Obtiene el registro de inventario de un repuesto a partir de su ID de catálogo.
     *
     * @param partId Identificador del repuesto en el catálogo.
     * @return Un opcional con el registro de inventario si está registrado en el almacén.
     */
    Optional<WorkshopInventory> findByPartId(UUID partId);
}

