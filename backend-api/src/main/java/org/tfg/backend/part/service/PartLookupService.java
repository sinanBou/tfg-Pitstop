package org.tfg.backend.part.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.part.*;

import java.util.List;
import java.util.UUID;

/**
 * Servicio encargado del acceso de lectura y consultas relacionadas con los repuestos,
 * incluyendo catálogo global, inventarios de talleres y asignación de piezas a citas.
 */
@Service
@RequiredArgsConstructor
public class PartLookupService {

    private final PartCatalogRepository partCatalogRepository;
    private final WorkshopInventoryRepository workshopInventoryRepository;
    private final AppointmentPartRepository appointmentPartRepository;
    private final PartCategoryRepository partCategoryRepository;

    /**
     * Obtiene todos los repuestos registrados en el catálogo global del sistema.
     *
     * @return Lista de repuestos del catálogo.
     */
    @Transactional(readOnly = true)
    public List<PartCatalog> getAllCatalog() {
        return partCatalogRepository.findAll();
    }

    /**
     * Obtiene el inventario de repuestos de un taller específico.
     *
     * @param workshopId Identificador único del taller.
     * @return Lista de artículos en el inventario del taller.
     */
    @Transactional(readOnly = true)
    public List<WorkshopInventory> getInventoryByWorkshop(UUID workshopId) {
        return workshopInventoryRepository.findByWorkshopId(workshopId);
    }

    /**
     * Obtiene la lista de repuestos asignados a una cita específica.
     *
     * @param appointmentId Identificador único de la cita.
     * @return Lista de repuestos asociados a la cita.
     */
    @Transactional(readOnly = true)
    public List<AppointmentPart> getPartsByAppointment(UUID appointmentId) {
        return appointmentPartRepository.findByAppointmentId(appointmentId);
    }

    /**
     * Obtiene la lista de categorías lógicas de repuestos registradas en un taller, ordenadas por nombre.
     *
     * @param workshopId Identificador único del taller.
     * @return Lista de categorías de repuestos.
     */
    @Transactional(readOnly = true)
    public List<PartCategory> getCategoriesByWorkshop(UUID workshopId) {
        return partCategoryRepository.findByWorkshopIdOrderByNameAsc(workshopId);
    }
}
