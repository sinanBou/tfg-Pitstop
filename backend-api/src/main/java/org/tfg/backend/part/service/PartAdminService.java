package org.tfg.backend.part.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.part.*;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PartAdminService {

    private final PartCatalogRepository partCatalogRepository;
    private final WorkshopInventoryRepository workshopInventoryRepository;
    private final PartCategoryRepository partCategoryRepository;
    private final AppointmentPartRepository appointmentPartRepository;
    private final PartAssignmentService partAssignmentService;
    private final org.tfg.backend.workshop.WorkshopRepository workshopRepository;

    public PartCategory findOrCreateCategory(String displayName, org.tfg.backend.workshop.Workshop workshop) {
        String slug = displayName.toLowerCase().trim()
                .replace(" ", "_")
                .replace("á", "a")
                .replace("é", "e")
                .replace("í", "i")
                .replace("ó", "o")
                .replace("ú", "u");
        return partCategoryRepository.findByNameAndWorkshopId(slug, workshop.getId())
                .orElseGet(() -> {
                    PartCategory newCat = PartCategory.builder()
                            .name(slug)
                            .displayName(displayName)
                            .workshop(workshop)
                            .build();
                    return partCategoryRepository.save(newCat);
                });
    }

    @Transactional
    public void initializeInventoryForWorkshop(org.tfg.backend.workshop.Workshop workshop) {
        findOrCreateCategory("Recambios personalizados", workshop);
        seedDemoPartsForWorkshop(workshop);
    }

    private void seedDemoPartsForWorkshop(org.tfg.backend.workshop.Workshop workshop) {
        createPartDemo("REF-1020", "Pastillas de freno Brembo", "Brembo", "Kit de pastillas de alto rendimiento", "Frenos", 45.0, 75.0, 5, workshop);
        createPartDemo("REF-3040", "Filtro de aceite Bosch", "Bosch", "Filtro purificador metálico", "Filtros", 8.0, 15.0, 10, workshop);
        createPartDemo("REF-5060", "Aceite Castrol EDGE 5W-30", "Castrol", "Garrafa de 5 litros de aceite sintético", "Lubricantes", 25.0, 48.0, 3, workshop);
        createPartDemo("REF-7080", "Filtro de aire Bosch", "Bosch", "Filtro de cabina lavable", "Filtros", 12.0, 22.0, 5, workshop);
        createPartDemo("REF-9010", "Bujía NGK Iridium", "NGK", "Bujía de alto rendimiento de iridio", "Encendido", 6.5, 12.0, 12, workshop);
    }

    private void createPartDemo(String oemRef, String name, String manufacturer, String specs, String categoryName,
                                double costPrice, double retailPrice, int stock, org.tfg.backend.workshop.Workshop workshop) {
        PartCategory category = findOrCreateCategory(categoryName, workshop);
        PartCatalog part = partCatalogRepository.findByOemReference(oemRef)
                .orElseGet(() -> {
                    PartCatalog p = PartCatalog.builder()
                            .oemReference(oemRef)
                            .name(name)
                            .manufacturer(manufacturer)
                            .technicalSpecs(specs)
                            .category(category)
                            .build();
                    return partCatalogRepository.save(p);
                });

        if (workshopInventoryRepository.findByPartIdAndWorkshopId(part.getId(), workshop.getId()).isEmpty()) {
            WorkshopInventory inventory = WorkshopInventory.builder()
                    .part(part)
                    .stockQuantity(stock)
                    .costPrice(costPrice)
                    .retailPrice(retailPrice)
                    .avisoThreshold(5)
                    .workshop(workshop)
                    .build();
            workshopInventoryRepository.save(inventory);
        }
    }

    @Transactional
    public WorkshopInventory addPartToInventory(String oemReference, String name, String manufacturer, String technicalSpecs, UUID categoryId,
                                                double costPrice, double retailPrice, int stockQuantity, int avisoThreshold, UUID workshopId) {
        PartCategory category = partCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        org.tfg.backend.workshop.Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));

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

        WorkshopInventory inventory = workshopInventoryRepository.findByPartIdAndWorkshopId(part.getId(), workshopId)
                .orElse(null);

        if (inventory != null) {
            inventory.setStockQuantity(inventory.getStockQuantity() + stockQuantity);
            return workshopInventoryRepository.save(inventory);
        }

        inventory = WorkshopInventory.builder()
                .part(part)
                .stockQuantity(stockQuantity)
                .costPrice(costPrice)
                .retailPrice(retailPrice)
                .avisoThreshold(avisoThreshold)
                .workshop(workshop)
                .build();
        return workshopInventoryRepository.save(inventory);
    }

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

    @Transactional
    public void deleteInventoryItem(UUID inventoryId) {
        WorkshopInventory inventory = workshopInventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("Pieza de inventario no encontrada"));

        java.util.List<AppointmentPart> appParts = appointmentPartRepository.findByPartId(inventory.getPart().getId());
        appointmentPartRepository.deleteAll(appParts);

        workshopInventoryRepository.delete(inventory);
        partCatalogRepository.delete(inventory.getPart());
    }

    @Transactional
    public PartCategory createCategory(String displayName, UUID workshopId) {
        org.tfg.backend.workshop.Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));

        String slug = displayName.toLowerCase().trim()
                .replace(" ", "_")
                .replace("á", "a")
                .replace("é", "e")
                .replace("í", "i")
                .replace("ó", "o")
                .replace("ú", "u");
        if (partCategoryRepository.findByNameAndWorkshopId(slug, workshopId).isPresent()) {
            throw new RuntimeException("Ya existe una categoría con este nombre");
        }
        PartCategory newCat = PartCategory.builder()
                .name(slug)
                .displayName(displayName)
                .workshop(workshop)
                .build();
        return partCategoryRepository.save(newCat);
    }

    @Transactional
    public void deleteCategory(UUID categoryId) {
        PartCategory category = partCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        if ("recambios_personalizados".equals(category.getName())) {
            throw new RuntimeException("La categoría 'Recambios personalizados' es fija y no se puede eliminar");
        }
        if (!category.getParts().isEmpty()) {
            throw new RuntimeException("No se puede eliminar una categoría que contiene repuestos");
        }
        partCategoryRepository.delete(category);
    }
}
