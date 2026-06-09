package org.tfg.backend.taskcatalog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio JPA de acceso a datos para la entidad {@link TaskCategory}.
 * Facilita la consulta y validación de categorías de tareas asociadas a talleres mecánicos.
 */
@Repository
public interface TaskCategoryRepository extends JpaRepository<TaskCategory, UUID> {
    /**
     * Obtiene todas las categorías de tareas de un taller, ordenadas alfabéticamente por su nombre técnico.
     *
     * @param workshopId Identificador único del taller.
     * @return Lista de categorías.
     */
    List<TaskCategory> findByWorkshopIdOrderByNameAsc(UUID workshopId);

    /**
     * Obtiene una categoría específica mediante su taller y nombre técnico.
     *
     * @param workshopId Identificador único del taller.
     * @param name Nombre clave técnico de la categoría.
     * @return Un Optional con la categoría si existe.
     */
    Optional<TaskCategory> findByWorkshopIdAndName(UUID workshopId, String name);

    /**
     * Comprueba si una categoría con un nombre técnico determinado ya está registrada en el taller.
     *
     * @param workshopId Identificador del taller.
     * @param name Nombre técnico de la categoría.
     * @return true si existe, false en caso contrario.
     */
    boolean existsByWorkshopIdAndName(UUID workshopId, String name);
}
