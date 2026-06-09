package org.tfg.backend.taskcatalog.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.taskcatalog.CatalogCategory;
import org.tfg.backend.taskcatalog.CatalogCategoryRepository;

import java.util.List;
import java.util.UUID;

/**
 * Servicio de lectura y consulta de datos del catálogo del taller,
 * optimizado para no generar bloqueos mediante transacciones de solo lectura.
 */
@Service
@RequiredArgsConstructor
public class CatalogLookupService {

    private final CatalogCategoryRepository categoryRepository;

    /**
     * Recupera el catálogo completo de un taller de forma transaccional optimizada para lectura.
     *
     * @param workshopId Identificador único del taller.
     * @return Lista de categorías del catálogo del taller.
     */
    @Transactional(readOnly = true)
    public List<CatalogCategory> getCatalog(UUID workshopId) {
        return categoryRepository.findByWorkshopIdOrderByNameAsc(workshopId);
    }
}
