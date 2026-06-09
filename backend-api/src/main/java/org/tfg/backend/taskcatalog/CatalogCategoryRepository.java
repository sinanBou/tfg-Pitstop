package org.tfg.backend.taskcatalog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio de persistencia JPA para la entidad {@link CatalogCategory}.
 * Proporciona métodos de consulta para buscar categorías por taller y verificar duplicados.
 */
@Repository
public interface CatalogCategoryRepository extends JpaRepository<CatalogCategory, UUID> {

    /**
     * Recupera las categorías de un taller ordenadas alfabéticamente por su nombre clave.
     *
     * @param workshopId Identificador del taller.
     * @return Lista de categorías del taller.
     */
    List<CatalogCategory> findByWorkshopIdOrderByNameAsc(UUID workshopId);

    /**
     * Busca una categoría específica por su nombre identificador dentro de un taller.
     *
     * @param workshopId Identificador del taller.
     * @param name Nombre identificador de la categoría.
     * @return Optional con la categoría encontrada.
     */
    Optional<CatalogCategory> findByWorkshopIdAndName(UUID workshopId, String name);

    /**
     * Verifica si existe una categoría con un nombre identificador dado en un taller determinado.
     *
     * @param workshopId Identificador del taller.
     * @param name Nombre identificador de la categoría.
     * @return true si ya existe, false en caso contrario.
     */
    boolean existsByWorkshopIdAndName(UUID workshopId, String name);
}
