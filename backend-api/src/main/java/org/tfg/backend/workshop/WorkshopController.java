package org.tfg.backend.workshop;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workshops")
@RequiredArgsConstructor
public class WorkshopController {

    private final WorkshopService workshopService;

    /**
     * Crea un nuevo taller.
     * @param request Datos del taller (CIF, Nombre, ID del dueño)
     * @return El taller creado con su UUID generado
     */
    @PostMapping
    public ResponseEntity<WorkshopDTO> createWorkshop(@RequestBody WorkshopRequest request) {
        return ResponseEntity.ok(workshopService.saveWorkshop(request));
    }

    /**
     * Lista todos los talleres registrados en el sistema.
     * Útil para que el administrador vea la red de talleres o para que el cliente elija uno.
     */
    @GetMapping
    public ResponseEntity<List<WorkshopDTO>> getAllWorkshops() {
        return ResponseEntity.ok(workshopService.getAllWorkshops());
    }

    /**
     * Obtiene los detalles de un taller específico.
     * @param id UUID del taller
     */
    @GetMapping("/{id}")
    public ResponseEntity<WorkshopDTO> getWorkshopById(@PathVariable UUID id) {
        return ResponseEntity.ok(workshopService.getWorkshopById(id));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<WorkshopDTO>> getWorkshopsByOwner(@PathVariable UUID ownerId) {
        return ResponseEntity.ok(workshopService.getWorkshopsByOwnerId(ownerId));
    }

    // En backend/workshop/WorkshopController.java

    /**
     * Actualiza la configuración de horario y duración de citas de un taller.
     * @param id UUID del taller a modificar
     * @param request Datos con el nuevo horario/duración
     */
    @PutMapping("/{id}/settings")
    public ResponseEntity<WorkshopDTO> updateSettings(
            @PathVariable UUID id,
            @RequestBody WorkshopRequest request) {
        return ResponseEntity.ok(workshopService.updateWorkshopSettings(id, request));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<WorkshopDTO>> searchWorkshops(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(workshopService.searchWorkshops(query, page, size));
    }

    /**
     * Sube un logo/imagen de perfil para el taller.
     */
    @PostMapping("/{id}/logo")
    public ResponseEntity<WorkshopDTO> uploadLogo(
            @PathVariable UUID id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            return ResponseEntity.ok(workshopService.uploadLogo(id, file));
        } catch (Exception e) {
            throw new RuntimeException("Error al subir el logo del taller: " + e.getMessage(), e);
        }
    }

    /**
     * Elimina el logo del taller.
     */
    @DeleteMapping("/{id}/logo")
    public ResponseEntity<WorkshopDTO> deleteLogo(@PathVariable UUID id) {
        return ResponseEntity.ok(workshopService.deleteLogo(id));
    }
}