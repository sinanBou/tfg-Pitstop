package org.tfg.backend.part;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/parts")
public class PartController {

    private final PartService partService;
    private final PartInventoryFacade partInventoryFacade;

    public PartController(PartService partService, PartInventoryFacade partInventoryFacade) {
        this.partService = partService;
        this.partInventoryFacade = partInventoryFacade;
    }

    @GetMapping("/catalog")
    public ResponseEntity<List<PartCatalog>> getCatalog() {
        return ResponseEntity.ok(partService.getAllCatalog());
    }

    @GetMapping("/inventory")
    public ResponseEntity<List<WorkshopInventory>> getInventory() {
        return ResponseEntity.ok(partService.getAllInventory());
    }

    @GetMapping("/appointments/{appointmentId}")
    public ResponseEntity<List<AppointmentPart>> getAppointmentParts(@PathVariable UUID appointmentId) {
        return ResponseEntity.ok(partService.getPartsByAppointment(appointmentId));
    }

    @PostMapping("/appointments/{appointmentId}")
    public ResponseEntity<?> addPartToAppointment(
            @PathVariable UUID appointmentId,
            @RequestBody Map<String, Object> payload) {
        try {
            int quantity = ((Number) payload.getOrDefault("quantity", 1)).intValue();
            double discount = ((Number) payload.getOrDefault("discount", 0.0)).doubleValue();

            AppointmentPart ap;
            if (payload.containsKey("customName") && payload.get("customName") != null && !((String) payload.get("customName")).trim().isEmpty()) {
                String customName = (String) payload.get("customName");
                ap = partService.assignCustomPartToAppointment(appointmentId, customName, quantity);
            } else {
                UUID partId = UUID.fromString((String) payload.get("partId"));
                if (discount > 0.0) {
                    ap = partInventoryFacade.addDiscountedPartToAppointment(appointmentId, partId, quantity, discount);
                } else {
                    ap = partInventoryFacade.addStandardPartToAppointment(appointmentId, partId, quantity);
                }
            }

            return ResponseEntity.ok(ap);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al asignar el repuesto");
        }
    }

    @DeleteMapping("/appointments/{appointmentId}/parts/{partId}")
    public ResponseEntity<?> removePartFromAppointment(
            @PathVariable UUID appointmentId,
            @PathVariable UUID partId) {
        try {
            partInventoryFacade.removePartAndRestoreInventory(appointmentId, partId);
            return ResponseEntity.ok("Repuesto eliminado y stock devuelto");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar el repuesto");
        }
    }

    @PostMapping("/inventory")
    public ResponseEntity<?> addInventoryItem(@RequestBody Map<String, Object> payload) {
        try {
            String oemReference = (String) payload.get("oemReference");
            String name = (String) payload.get("name");
            String manufacturer = (String) payload.get("manufacturer");
            String technicalSpecs = (String) payload.get("technicalSpecs");
            String categoryIdStr = (String) payload.get("categoryId");
            UUID categoryId = UUID.fromString(categoryIdStr);
            double costPrice = ((Number) payload.get("costPrice")).doubleValue();
            double retailPrice = ((Number) payload.get("retailPrice")).doubleValue();
            int stockQuantity = ((Number) payload.get("stockQuantity")).intValue();
            int avisoThreshold = ((Number) payload.getOrDefault("avisoThreshold", 5)).intValue();

            WorkshopInventory inventory = partService.addPartToInventory(
                    oemReference, name, manufacturer, technicalSpecs, categoryId,
                    costPrice, retailPrice, stockQuantity, avisoThreshold
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(inventory);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/inventory/{id}")
    public ResponseEntity<?> updateInventoryItem(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> payload) {
        try {
            String oemReference = (String) payload.get("oemReference");
            String name = (String) payload.get("name");
            String manufacturer = (String) payload.get("manufacturer");
            String technicalSpecs = (String) payload.get("technicalSpecs");
            String categoryIdStr = (String) payload.get("categoryId");
            UUID categoryId = UUID.fromString(categoryIdStr);
            double costPrice = ((Number) payload.get("costPrice")).doubleValue();
            double retailPrice = ((Number) payload.get("retailPrice")).doubleValue();
            int stockQuantity = ((Number) payload.get("stockQuantity")).intValue();
            int avisoThreshold = ((Number) payload.getOrDefault("avisoThreshold", 5)).intValue();

            WorkshopInventory inventory = partService.updateInventoryItem(
                    id, oemReference, name, manufacturer, technicalSpecs, categoryId,
                    costPrice, retailPrice, stockQuantity, avisoThreshold
                );
            return ResponseEntity.ok(inventory);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/inventory/{id}")
    public ResponseEntity<?> deleteInventoryItem(@PathVariable UUID id) {
        try {
            partService.deleteInventoryItem(id);
            return ResponseEntity.ok("Pieza de inventario eliminada correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<List<PartCategory>> getCategories() {
        return ResponseEntity.ok(partService.getAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody Map<String, Object> payload) {
        try {
            String displayName = (String) payload.get("displayName");
            PartCategory category = partService.createCategory(displayName);
            return ResponseEntity.status(HttpStatus.CREATED).body(category);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable UUID id) {
        try {
            partService.deleteCategory(id);
            return ResponseEntity.ok("Categoría eliminada correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
