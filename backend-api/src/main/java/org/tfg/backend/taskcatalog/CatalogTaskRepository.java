package org.tfg.backend.taskcatalog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CatalogTaskRepository extends JpaRepository<CatalogTask, UUID> {
    /**
    * Lista todas las tareas de catÃ¡logo registradas para un taller, ordenadas por su cÃ³digo Ãºnico de tarea.
    *
    * @param workshopId Identificador del taller.
    * @return Lista de tareas encontradas.
    */
    List<CatalogTask> findByCategoryWorkshopIdOrderByCodeAsc(UUID workshopId);
    Optional<CatalogTask> findByCategoryWorkshopIdAndCode(UUID workshopId, String code);
    boolean existsByCategoryWorkshopIdAndCode(UUID workshopId, String code);
}