package org.tfg.backend.part.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.part.*;

import java.util.UUID;

/**
 * Servicio encargado de la administración y configuración de repuestos, categorías y existencias en el inventario.
 * Proporciona métodos para registrar nuevos artículos, modificar precios, actualizar existencias y eliminar
 * piezas o categorías del catálogo.
 */
@Service
@RequiredArgsConstructor
public class PartAdminService {

    private final PartCatalogRepository partCatalogRepository;
    private final WorkshopInventoryRepository workshopInventoryRepository;
    private final PartCategoryRepository partCategoryRepository;
    private final AppointmentPartRepository appointmentPartRepository;
    private final PartAssignmentService partAssignmentService;

    /**
     * Busca una categoría por su nombre normalizado (slug) o la crea si no existe.
     *
     * @param displayName Nombre a mostrar de la categoría.
     * @return La categoría encontrada o creada.
     */
    private PartCategory findOrCreateCategory(String displayName) {
        String slug = displayName.toLowerCase().trim()
                .replace(" ", "_")
                .replace("á", "a")
                .replace("é", "e")
                .replace("í", "i")
                .replace("ó", "o")
                .replace("ú", "u");
        return partCategoryRepository.findByName(slug)
                .orElseGet(() -> {
                    PartCategory newCat = PartCategory.builder()
                            .name(slug)
                            .displayName(displayName)
                            .build();
                    return partCategoryRepository.save(newCat);
                });
    }

    /**
     * Asegura que exista la categoría fija para repuestos personalizados genéricos.
     */
    @PostConstruct
    @Transactional
    public void ensureFixedCategoryExists() {
        findOrCreateCategory("Recambios personalizados");
    }

    /**
     * Inicializa repuestos y categorías de prueba si la base de datos no contiene elementos.
     */
    @PostConstruct
    @Transactional
    public void initDemoParts() {
        if (partCatalogRepository.count() > 0) return;

        createPartDemo("REF-1020", "Pastillas de freno Brembo", "Brembo", "Kit de pastillas de alto rendimiento", "Frenos", 45.0, 75.0, 5);
        createPartDemo("REF-3040", "Filtro de aceite Bosch", "Bosch", "Filtro purificador metálico", "Filtros", 8.0, 15.0, 10);
        createPartDemo("REF-5060", "Aceite Castrol EDGE 5W-30", "Castrol", "Garrafa de 5 litros de aceite sintético", "Lubricantes", 25.0, 48.0, 3);
        createPartDemo("REF-7080", "Filtro de aire Bosch", "Bosch", "Filtro de cabina lavable", "Filtros", 12.0, 22.0, 5);
        createPartDemo("REF-9010", "Bujía NGK Iridium", "NGK", "Bujía de alto rendimiento de iridio", "Encendido", 6.5, 12.0, 12);
    }

    /**
     * Crea un repuesto auxiliar en catálogo e inventario para propósitos de prueba o demostración.
     */
    private void createPartDemo(String oemRef, String name, String manufacturer, String specs, String categoryName,
                                double costPrice, double retailPrice, int stock) {
        PartCategory category = findOrCreateCategory(categoryName);
        PartCatalog part = PartCatalog.builder()
                .oemReference(oemRef)
                .name(name)
                .manufacturer(manufacturer)
                .technicalSpecs(specs)
                .category(category)
                .build();
        partCatalogRepository.save(part);

        WorkshopInventory inventory = WorkshopInventory.builder()
                .part(part)
                .stockQuantity(stock)
                .costPrice(costPrice)
                .retailPrice(retailPrice)
                .avisoThreshold(5)
                .build();
        workshopInventoryRepository.save(inventory);
    }

    /**
     * Registra un nuevo repuesto en el catálogo y define su inventario inicial en el taller.
     *
     * @param oemReference Código o referencia del fabricante original (OEM).
     * @param name Nombre comercial o descriptivo del artículo.
     * @param manufacturer Fabricante de la pieza.
     * @param technicalSpecs Ficha o especificaciones técnicas del producto.
     * @param categoryId Identificador único de la categoría.
     * @param costPrice Precio de costo.
     * @param retailPrice Precio sugerido de venta al público.
     * @param stockQuantity Unidades iniciales en stock.
     * @param avisoThreshold Umbral para alertas de stock bajo.
     * @return El registro de inventario creado {@link WorkshopInventory}.
     */
    @Transactional
    public WorkshopInventory addPartToInventory(String oemReference, String name, String manufacturer, String technicalSpecs, UUID categoryId,
                                                double costPrice, double retailPrice, int stockQuantity, int avisoThreshold) {
        PartCategory category = partCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        String cleanOem = (oemReference != null && !oemReference.trim().isEmpty()) ? oemReference.trim() : null;

        PartCatalog part = null;
        if (cleanOem != null) {
            part = partCatalogRepository.findByOemReference(cleanOem).orElse(null);
        }

        if (part == null) {
            part = PartCatalog.builder()
                    .oemReference(cleanOem)
                    .name(name)
                    .manufacturer(manufacturer)
                    .technicalSpecs(technicalSpecs)
                    .category(category)
                    .build();
            partCatalogRepository.save(part);
        }

        WorkshopInventory inventory = WorkshopInventory.builder()
                .part(part)
                .stockQuantity(stockQuantity)
                .costPrice(costPrice)
                .retailPrice(retailPrice)
                .avisoThreshold(avisoThreshold)
                .build();
        return workshopInventoryRepository.save(inventory);
    }

    /**
     * Modifica los campos de catálogo e inventario para un artículo registrado.
     * Si la pieza posee asignaciones históricas con precio pendiente, actualiza su valor al nuevo precio de venta.
     *
     * @param inventoryId Identificador único de inventario.
     * @param oemReference Nueva referencia OEM.
     * @param name Nuevo nombre comercial.
     * @param manufacturer Nuevo fabricante.
     * @param technicalSpecs Nuevas especificaciones técnicas.
     * @param categoryId Identificador de la nueva categoría.
     * @param costPrice Nuevo precio de costo.
     * @param retailPrice Nuevo precio de venta al público.
     * @param stockQuantity Nueva cantidad disponible.
     * @param avisoThreshold Nuevo umbral de aviso.
     * @return El registro de inventario modificado {@link WorkshopInventory}.
     */
    @Transactional
    public WorkshopInventory updateInventoryItem(UUID inventoryId, String oemReference, String name, String manufacturer, String technicalSpecs, UUID categoryId,
                                                 double costPrice, double retailPrice, int stockQuantity, int avisoThreshold) {
        WorkshopInventory inventory = workshopInventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("Pieza de inventario no encontrada"));

        PartCategory category = partCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        String cleanOem = (oemReference != null && !oemReference.trim().isEmpty()) ? oemReference.trim() : null;

        PartCatalog part = inventory.getPart();
        part.setOemReference(cleanOem);
        part.setName(name);
        part.setManufacturer(manufacturer);
        part.setTechnicalSpecs(technicalSpecs);
        part.setCategory(category);
        partCatalogRepository.save(part);

        inventory.setStockQuantity(stockQuantity);
        inventory.setCostPrice(costPrice);
        inventory.setRetailPrice(retailPrice);
        inventory.setAvisoThreshold(avisoThreshold);

        java.util.List<AppointmentPart> appParts = appointmentPartRepository.findByPartId(part.getId());
        for (AppointmentPart ap : appParts) {
            if (ap.getAppliedPrice() == null || ap.getAppliedPrice() <= 0.0) {
                ap.setAppliedPrice(retailPrice);
                appointmentPartRepository.save(ap);
                partAssignmentService.recalculateAppointmentTotal(ap.getAppointment());
            }
        }

        return workshopInventoryRepository.save(inventory);
    }

    /**
     * Elimina un artículo del inventario y del catálogo general, limpiando previamente todas sus asignaciones a citas.
     *
     * @param inventoryId Identificador del artículo en inventario.
     */
    @Transactional
    public void deleteInventoryItem(UUID inventoryId) {
        WorkshopInventory inventory = workshopInventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("Pieza de inventario no encontrada"));

        java.util.List<AppointmentPart> appParts = appointmentPartRepository.findByPartId(inventory.getPart().getId());
        appointmentPartRepository.deleteAll(appParts);

        workshopInventoryRepository.delete(inventory);
        partCatalogRepository.delete(inventory.getPart());
    }

    /**
     * Registra una nueva categoría de repuestos en el sistema a partir de su nombre.
     *
     * @param displayName Nombre visible de la categoría.
     * @return La categoría creada {@link PartCategory}.
     */
    @Transactional
    public PartCategory createCategory(String displayName) {
        String slug = displayName.toLowerCase().trim()
                .replace(" ", "_")
                .replace("á", "a")
                .replace("é", "e")
                .replace("í", "i")
                .replace("ó", "o")
                .replace("ú", "u");
        if (partCategoryRepository.findByName(slug).isPresent()) {
            throw new RuntimeException("Ya existe una categoría con este nombre");
        }
        PartCategory newCat = PartCategory.builder()
                .name(slug)
                .displayName(displayName)
                .build();
        return partCategoryRepository.save(newCat);
    }

    /**
     * Elimina una categoría del sistema si no contiene repuestos y no es una categoría protegida.
     *
     * @param categoryId Identificador de la categoría.
     */
    @Transactional
    public void deleteCategory(UUID categoryId) {
        PartCategory category = partCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        if ("recambios_personalizados".equals(category.getName()) || "recambios_peronalizados".equals(category.getName())) {
            throw new RuntimeException("La categoría 'Recambios personalizados' es fija y no se puede eliminar");
        }
        if (!category.getParts().isEmpty()) {
            throw new RuntimeException("No se puede eliminar una categoría que contiene repuestos");
        }
        partCategoryRepository.delete(category);
    }
}
