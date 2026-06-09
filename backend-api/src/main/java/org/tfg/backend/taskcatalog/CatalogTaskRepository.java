package org.tfg.backend.taskcatalog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio JPA de persistencia para la entidad {@link CatalogTask}.
 * Permite buscar y gestionar las tareas del catálogo filtradas por taller.
 */
@Repository
public interface CatalogTaskRepository extends JpaRepository<CatalogTask, UUID> {

    /**
     * Lista todas las tareas de catálogo registradas para un taller, ordenadas por su código único de tarea.
     *
     * @param workshopId Identificador del taller.
     * @return Lista de tareas encontradas.
     */
    List<CatalogTask> findByCategoryWorkshopIdOrderByCodeAsc(UUID workshopId);

    /**
     * Busca una tarea específica por su código identificador y el taller asociado.
     *
     * @param workshopId Identificador del taller.
     * @param code Código de la tarea.
     * @return Optional con la tarea encontrada.
     */
    Optional<CatalogTask> findByCategoryWorkshopIdAndCode(UUID workshopId, String code);

    /**
     * Comprueba si una tarea con un código particular ya existe en un taller.
     *
     * @param workshopId Identificador del taller.
     * @param code Código de la tarea.
     * @return true si existe, false si no.
     */
    boolean existsByCategoryWorkshopIdAndCode(UUID workshopId, String code);
}
