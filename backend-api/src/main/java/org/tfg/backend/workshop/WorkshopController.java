package org.tfg.backend.workshop;

import lombok.RequiredArgsConstructor;
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
}