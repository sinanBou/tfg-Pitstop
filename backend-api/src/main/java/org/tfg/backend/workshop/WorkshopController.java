package org.tfg.backend.workshop;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controlador REST que expone los endpoints de la API para la gestión de talleres,
 * permitiendo registrar nuevos talleres, listar o buscar talleres, modificar parámetros
 * operativos (horarios, días, tarifa) y gestionar la subida o eliminación del logotipo.
 */
@RestController
@RequestMapping("/api/workshops")
@RequiredArgsConstructor
public class WorkshopController {

    private final WorkshopService workshopService;

    /**
     * Crea un nuevo taller en el sistema.
     *
     * @param request Datos del taller a registrar (CIF, Nombre, ID del dueño, etc.).
     * @return El taller creado formateado como DTO.
     */
    @PostMapping
    public ResponseEntity<WorkshopDTO> createWorkshop(@RequestBody WorkshopRequest request) {
        return ResponseEntity.ok(workshopService.saveWorkshop(request));
    }

    /**
     * Lista todos los talleres registrados en el sistema.
     * Útil para que los administradores vean la red de talleres o los clientes seleccionen uno.
     *
     * @return Respuesta HTTP con la lista de talleres.
     */
    @GetMapping
    public ResponseEntity<List<WorkshopDTO>> getAllWorkshops() {
        return ResponseEntity.ok(workshopService.getAllWorkshops());
    }

    /**
     * Obtiene los detalles de un taller específico a partir de su identificador único.
     *
     * @param id Identificador único (UUID) del taller.
     * @return El DTO con los detalles del taller.
     */
    @GetMapping("/{id}")
    public ResponseEntity<WorkshopDTO> getWorkshopById(@PathVariable UUID id) {
        return ResponseEntity.ok(workshopService.getWorkshopById(id));
    }

    /**
     * Recupera todos los talleres pertenecientes a un propietario concreto.
     *
     * @param ownerId Identificador único del empleado propietario.
     * @return Lista de talleres asociados a ese dueño.
     */
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<WorkshopDTO>> getWorkshopsByOwner(@PathVariable UUID ownerId) {
        return ResponseEntity.ok(workshopService.getWorkshopsByOwnerId(ownerId));
    }

    /**
     * Actualiza la configuración de horario, días laborables y duración de citas de un taller.
     *
     * @param id Identificador único del taller a modificar.
     * @param request Datos con el nuevo horario, tarifa y duración del slot.
     * @return El DTO con la configuración modificada.
     */
    @PutMapping("/{id}/settings")
    public ResponseEntity<WorkshopDTO> updateSettings(
            @PathVariable UUID id,
            @RequestBody WorkshopRequest request) {
        return ResponseEntity.ok(workshopService.updateWorkshopSettings(id, request));
    }

    /**
     * Realiza una búsqueda paginada y filtrada de talleres en base a una coincidencia de texto.
     *
     * @param query Término de búsqueda (nombre, dirección, CIF).
     * @param page Número de página actual (0 por defecto).
     * @param size Cantidad de resultados por página (10 por defecto).
     * @return Página de talleres coincidentes formateados como DTOs.
     */
    @GetMapping("/search")
    public ResponseEntity<Page<WorkshopDTO>> searchWorkshops(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(workshopService.searchWorkshops(query, page, size));
    }

    /**
     * Sube un archivo de imagen para el logotipo del taller.
     *
     * @param id Identificador único del taller.
     * @param file Archivo de imagen multiparte.
     * @return El taller actualizado con la URL del logotipo.
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
     * Elimina el logotipo de taller actual tanto del almacenamiento como de la base de datos.
     *
     * @param id Identificador único del taller.
     * @return El taller con el campo del logotipo restaurado a nulo.
     */
    @DeleteMapping("/{id}/logo")
    public ResponseEntity<WorkshopDTO> deleteLogo(@PathVariable UUID id) {
        return ResponseEntity.ok(workshopService.deleteLogo(id));
    }
}