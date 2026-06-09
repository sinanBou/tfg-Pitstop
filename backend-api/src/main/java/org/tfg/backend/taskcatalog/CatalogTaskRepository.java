package org.tfg.backend.taskcatalog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio JPA de acceso a datos para la entidad {@link CatalogTask}.
 * Permite buscar tareas del catálogo asociadas al taller y validar unicidad de códigos.
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
     * Busca una tarea específica por taller y código de tarea.
     *
     * @param workshopId Identificador del taller.
     * @param code Código único de la tarea.
     * @return Un Optional con la tarea del catálogo si existe.
     */
    Optional<CatalogTask> findByCategoryWorkshopIdAndCode(UUID workshopId, String code);

    /**
     * Comprueba si existe alguna tarea con el código indicado dentro del taller provisto.
     *
     * @param workshopId Identificador del taller.
     * @param code Código de la tarea.
     * @return true si existe la tarea, false en caso contrario.
     */
    boolean existsByCategoryWorkshopIdAndCode(UUID workshopId, String code);
}