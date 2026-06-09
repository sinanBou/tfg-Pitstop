package org.tfg.backend.part;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;
import java.util.List;

/**
 * Repositorio JPA para realizar operaciones de persistencia sobre el catálogo
 * general de repuestos {@link PartCatalog}.
 */
@Repository
public interface PartCatalogRepository extends JpaRepository<PartCatalog, UUID> {
    /**
     * Busca un repuesto en el catálogo a partir de su referencia original OEM.
     *
     * @param oemReference Referencia única del fabricante original.
     * @return Un opcional con el repuesto del catálogo si se encuentra.
     */
    Optional<PartCatalog> findByOemReference(String oemReference);

    /**
     * Encuentra repuestos en el catálogo que coincidan con un nombre determinado.
     *
     * @param name Nombre o descripción del repuesto.
     * @return Lista de repuestos coincidentes.
     */
    List<PartCatalog> findByName(String name);
}

