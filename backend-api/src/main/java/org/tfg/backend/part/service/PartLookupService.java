package org.tfg.backend.part.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.part.*;

import java.util.List;
import java.util.UUID;

/**
 * Servicio especializado en operaciones de búsqueda y lectura de catálogo, inventario y categorías de repuestos.
 * Todos sus métodos se ejecutan bajo transacciones de sólo lectura para optimizar el rendimiento.
 */
@Service
@RequiredArgsConstructor
public class PartLookupService {

    private final PartCatalogRepository partCatalogRepository;
    private final WorkshopInventoryRepository workshopInventoryRepository;
    private final AppointmentPartRepository appointmentPartRepository;
    private final PartCategoryRepository partCategoryRepository;

    /**
     * Obtiene el catálogo completo de repuestos registrados.
     *
     * @return Lista de artículos en catálogo.
     */
    @Transactional(readOnly = true)
    public List<PartCatalog> getAllCatalog() {
        return partCatalogRepository.findAll();
    }

    /**
     * Obtiene el inventario completo de existencias en almacén.
     *
     * @return Lista de artículos en inventario.
     */
    @Transactional(readOnly = true)
    public List<WorkshopInventory> getAllInventory() {
        return workshopInventoryRepository.findAll();
    }

    /**
     * Recupera la lista de repuestos asignados a una cita determinada.
     *
     * @param appointmentId Identificador único de la cita.
     * @return Lista de repuestos en la cita.
     */
    @Transactional(readOnly = true)
    public List<AppointmentPart> getPartsByAppointment(UUID appointmentId) {
        return appointmentPartRepository.findByAppointmentId(appointmentId);
    }

    /**
     * Obtiene la lista de categorías lógicas registradas.
     *
     * @return Lista de categorías de repuestos.
     */
    @Transactional(readOnly = true)
    public List<PartCategory> getAllCategories() {
        return partCategoryRepository.findAll();
    }
}
