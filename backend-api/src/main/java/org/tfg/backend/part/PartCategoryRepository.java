package org.tfg.backend.part;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;

/**
 * Repositorio JPA para realizar operaciones de persistencia sobre las categorías
 * de repuestos {@link PartCategory}.
 */
@Repository
public interface PartCategoryRepository extends JpaRepository<PartCategory, UUID> {
    /**
     * Busca una categoría de repuesto por su identificador lógico o nombre único.
     *
     * @param name Nombre identificativo único de la categoría.
     * @return Un opcional con la categoría si existe.
     */
    Optional<PartCategory> findByName(String name);
}

