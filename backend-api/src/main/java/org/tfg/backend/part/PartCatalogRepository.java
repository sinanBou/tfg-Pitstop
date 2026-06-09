package org.tfg.backend.part;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;
import java.util.List;

/**
 * Repositorio JPA para realizar operaciones de persistencia sobre la entidad PartCatalog.
 */
@Repository
public interface PartCatalogRepository extends JpaRepository<PartCatalog, UUID> {
    /**
     * Busca un repuesto en el catálogo usando su referencia OEM y el identificador del taller.
     *
     * @param oemReference La referencia OEM.
     * @param workshopId El identificador del taller.
     * @return Un Optional con el repuesto si existe.
     */
    Optional<PartCatalog> findByOemReferenceAndCategoryWorkshopId(String oemReference, UUID workshopId);

    /**
     * Encuentra repuestos en el catálogo que coincidan con un nombre determinado.
     *
     * @param name Nombre o descripción del repuesto.
     * @return Lista de repuestos coincidentes.
     */
    List<PartCatalog> findByName(String name);
}