package org.tfg.backend.part;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;

import java.util.List;

/**
 * Repositorio JPA para realizar operaciones de persistencia sobre la entidad PartCategory.
 */
@Repository
public interface PartCategoryRepository extends JpaRepository<PartCategory, UUID> {
    /**
     * Encuentra una categoría específica por su nombre e identificador del taller.
     *
     * @param name Nombre de la categoría.
     * @param workshopId Identificador único del taller.
     * @return Un Optional con la categoría encontrada.
     */
    Optional<PartCategory> findByNameAndWorkshopId(String name, UUID workshopId);

    /**
     * Obtiene la lista de categorías registradas para un taller específico.
     *
     * @param workshopId Identificador único del taller.
     * @return Lista de categorías asociadas al taller.
     */
    List<PartCategory> findByWorkshopId(UUID workshopId);

    /**
     * Obtiene la lista de categorías de un taller ordenadas alfabéticamente por su nombre.
     *
     * @param workshopId Identificador único del taller.
     * @return Lista ordenada de categorías.
     */
    List<PartCategory> findByWorkshopIdOrderByNameAsc(UUID workshopId);
}
