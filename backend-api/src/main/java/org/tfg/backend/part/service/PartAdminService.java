package org.tfg.backend.part.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.part.*;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PartAdminService {

    private final PartCatalogRepository partCatalogRepository;
    private final WorkshopInventoryRepository workshopInventoryRepository;
    private final PartCategoryRepository partCategoryRepository;
    private final AppointmentPartRepository appointmentPartRepository;
    private final PartAssignmentService partAssignmentService;
    private final org.tfg.backend.workshop.WorkshopRepository workshopRepository;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

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
        
        log.info("Inicializando catálogo de repuestos por defecto para el taller: {}", workshop.getCompanyName());
        try {
            org.springframework.core.io.ClassPathResource resource = new org.springframework.core.io.ClassPathResource("repuestosDefecto.json");
            try (java.io.InputStream is = resource.getInputStream()) {
                com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(is);
                com.fasterxml.jackson.databind.JsonNode categorias = root.get("categorias");
                if (categorias != null) {
                    java.util.Iterator<java.util.Map.Entry<String, com.fasterxml.jackson.databind.JsonNode>> fields = categorias.fields();
                    while (fields.hasNext()) {
                        java.util.Map.Entry<String, com.fasterxml.jackson.databind.JsonNode> field = fields.next();
                        String categoryKey = field.getKey();
                        com.fasterxml.jackson.databind.JsonNode categoryNode = field.getValue();
                        
                        String displayName = categoryNode.has("displayName") ? categoryNode.get("displayName").asText() : categoryKey;
                        PartCategory category = findOrCreateCategory(displayName, workshop);
                        
                        com.fasterxml.jackson.databind.JsonNode repuestos = categoryNode.get("repuestos");
                        if (repuestos != null && repuestos.isArray()) {
                            for (com.fasterxml.jackson.databind.JsonNode partNode : repuestos) {
                                String oemRef = partNode.get("oemReference").asText();
                                String name = partNode.get("name").asText();
                                String manufacturer = partNode.get("manufacturer").asText();
                                String specs = partNode.has("technicalSpecs") ? partNode.get("technicalSpecs").asText() : "";
                                double costPrice = partNode.get("costPrice").asDouble();
                                double retailPrice = partNode.get("retailPrice").asDouble();
                                int stock = partNode.get("stockQuantity").asInt();
                                int avisoThreshold = partNode.has("avisoThreshold") ? partNode.get("avisoThreshold").asInt() : 5;
                                
                                createPartInInventory(oemRef, name, manufacturer, specs, category, costPrice, retailPrice, stock, avisoThreshold, workshop);
                            }
                        }
                    }
                }
            }
            log.info("Catálogo de repuestos inicializado con éxito para el taller: {}", workshop.getCompanyName());
        } catch (Exception e) {
            log.error("Error al inicializar el catálogo de repuestos para el taller {}", workshop.getCompanyName(), e);
            throw new RuntimeException("No se pudo cargar el catálogo de repuestos por defecto", e);
        }
    }

    private void createPartInInventory(String oemRef, String name, String manufacturer, String specs, PartCategory category,
                                       double costPrice, double retailPrice, int stock, int avisoThreshold, org.tfg.backend.workshop.Workshop workshop) {
        PartCatalog part = partCatalogRepository.findByOemReferenceAndCategoryWorkshopId(oemRef, workshop.getId())
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
                    .avisoThreshold(avisoThreshold)
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
            part = partCatalogRepository.findByOemReferenceAndCategoryWorkshopId(cleanOem, workshopId).orElse(null);
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
