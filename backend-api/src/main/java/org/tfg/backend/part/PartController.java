package org.tfg.backend.part;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.tfg.backend.part.service.PartAdminService;
import org.tfg.backend.part.service.PartLookupService;
import org.tfg.backend.part.service.PartAssignmentService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controlador REST para gestionar operaciones relacionadas con repuestos,
 * catálogo de piezas, inventario y su asignación a citas.
 */
@RestController
@RequestMapping("/api/parts")
public class PartController {

    private final PartAdminService partAdminService;
    private final PartLookupService partLookupService;
    private final PartAssignmentService partAssignmentService;
    private final PartInventoryFacade partInventoryFacade;

    /**
     * Constructor para la inyección de dependencias del controlador de repuestos.
     *
     * @param partAdminService Servicio de administración de repuestos.
     * @param partLookupService Servicio de consulta de repuestos.
     * @param partAssignmentService Servicio de asignación de repuestos a citas.
     * @param partInventoryFacade Fachada para operaciones de inventario de repuestos.
     */
    public PartController(PartAdminService partAdminService, 
                          PartLookupService partLookupService, 
                          PartAssignmentService partAssignmentService, 
                          PartInventoryFacade partInventoryFacade) {
        this.partAdminService = partAdminService;
        this.partLookupService = partLookupService;
        this.partAssignmentService = partAssignmentService;
        this.partInventoryFacade = partInventoryFacade;
    }

    /**
     * Obtiene el catálogo completo de repuestos registrados en el sistema.
     *
     * @return Respuesta HTTP con la lista de repuestos del catálogo.
     */
    @GetMapping("/catalog")
    public ResponseEntity<List<PartCatalog>> getCatalog() {
        return ResponseEntity.ok(partLookupService.getAllCatalog());
    }

    /**
     * Obtiene el inventario completo de existencias en almacén para un taller específico.
     *
     * @param workshopId Identificador único del taller.
     * @return Respuesta HTTP con la lista de artículos y stock en inventario.
     */
    @GetMapping("/workshop/{workshopId}/inventory")
    public ResponseEntity<List<WorkshopInventory>> getInventory(@PathVariable UUID workshopId) {
        return ResponseEntity.ok(partLookupService.getInventoryByWorkshop(workshopId));
    }

    /**
     * Obtiene todos los repuestos asociados a una cita específica.
     *
     * @param appointmentId Identificador único de la cita.
     * @return Respuesta HTTP con la lista de repuestos asignados a la cita.
     */
    @GetMapping("/appointments/{appointmentId}")
    public ResponseEntity<List<AppointmentPart>> getAppointmentParts(@PathVariable UUID appointmentId) {
        return ResponseEntity.ok(partLookupService.getPartsByAppointment(appointmentId));
    }

    /**
     * Asigna un repuesto a una cita concreta. Soporta repuestos estándar, con descuento aplicado
     * o repuestos personalizados genéricos.
     *
     * @param appointmentId Identificador único de la cita.
     * @param payload Datos del repuesto a asignar (partId, quantity, discount, o customName).
     * @return Respuesta HTTP con el repuesto asignado o detalles del error.
     */
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
                ap = partAssignmentService.assignCustomPartToAppointment(appointmentId, customName, quantity);
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

    /**
     * Elimina la asignación de un repuesto de una cita y devuelve la cantidad al inventario del almacén.
     *
     * @param appointmentId Identificador único de la cita.
     * @param partId Identificador único del repuesto a retirar.
     * @return Respuesta HTTP de éxito o código de error.
     */
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

    /**
     * Añade un nuevo artículo al inventario del taller (y al catálogo si es necesario).
     *
     * @param workshopId Identificador único del taller.
     * @param payload Información del repuesto y stock (oemReference, name, manufacturer, precios, stock, etc.).
     * @return Respuesta HTTP con el objeto de inventario creado.
     */
    @PostMapping("/workshop/{workshopId}/inventory")
    public ResponseEntity<?> addInventoryItem(
            @PathVariable UUID workshopId,
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

            WorkshopInventory inventory = partAdminService.addPartToInventory(
                    oemReference, name, manufacturer, technicalSpecs, categoryId,
                    costPrice, retailPrice, stockQuantity, avisoThreshold, workshopId
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(inventory);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Actualiza los datos de existencias, precios y características de un artículo de inventario.
     *
     * @param id Identificador único del artículo en inventario.
     * @param payload Nuevos valores para el inventario y catálogo.
     * @return Respuesta HTTP con el objeto de inventario modificado.
     */
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

            WorkshopInventory inventory = partAdminService.updateInventoryItem(
                    id, oemReference, name, manufacturer, technicalSpecs, categoryId,
                    costPrice, retailPrice, stockQuantity, avisoThreshold
                );
            return ResponseEntity.ok(inventory);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Elimina un artículo del inventario del almacén y sus relaciones asociadas.
     *
     * @param id Identificador único del artículo en inventario.
     * @return Respuesta HTTP de éxito o detalles del error.
     */
    @DeleteMapping("/inventory/{id}")
    public ResponseEntity<?> deleteInventoryItem(@PathVariable UUID id) {
        try {
            partAdminService.deleteInventoryItem(id);
            return ResponseEntity.ok("Pieza de inventario eliminada correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Obtiene la lista de todas las categorías lógicas de repuestos para un taller.
     *
     * @param workshopId Identificador único del taller.
     * @return Respuesta HTTP con la lista de categorías.
     */
    @GetMapping("/workshop/{workshopId}/categories")
    public ResponseEntity<List<PartCategory>> getCategories(@PathVariable UUID workshopId) {
        return ResponseEntity.ok(partLookupService.getCategoriesByWorkshop(workshopId));
    }

    /**
     * Crea una nueva categoría para clasificar repuestos en el taller.
     *
     * @param workshopId Identificador único del taller.
     * @param payload Datos de la categoría (displayName).
     * @return Respuesta HTTP con la categoría creada.
     */
    @PostMapping("/workshop/{workshopId}/categories")
    public ResponseEntity<?> createCategory(
            @PathVariable UUID workshopId,
            @RequestBody Map<String, Object> payload) {
        try {
            String displayName = (String) payload.get("displayName");
            PartCategory category = partAdminService.createCategory(displayName, workshopId);
            return ResponseEntity.status(HttpStatus.CREATED).body(category);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Elimina una categoría del sistema si no contiene repuestos asociados y no está protegida.
     *
     * @param id Identificador único de la categoría.
     * @return Respuesta HTTP de éxito o detalles del error.
     */
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable UUID id) {
        try {
            partAdminService.deleteCategory(id);
            return ResponseEntity.ok("Categoría eliminada correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}