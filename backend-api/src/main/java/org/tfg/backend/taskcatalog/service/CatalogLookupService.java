package org.tfg.backend.taskcatalog.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.taskcatalog.TaskCategory;
import org.tfg.backend.taskcatalog.TaskCategoryRepository;

import java.util.List;
import java.util.UUID;

/**
 * Servicio encargado de la consulta optimizada y de solo lectura del catálogo de tareas de un taller.
 */
@Service
@RequiredArgsConstructor
public class CatalogLookupService {

    private final TaskCategoryRepository categoryRepository;

    /**
     * Obtiene de forma transaccional de solo lectura las categorías y tareas de catálogo de un taller mecánico.
     *
     * @param workshopId Identificador único del taller.
     * @return Lista de categorías.
     */
    @Transactional(readOnly = true)
    public List<TaskCategory> getCatalog(UUID workshopId) {
        return categoryRepository.findByWorkshopIdOrderByNameAsc(workshopId);
    }
}
