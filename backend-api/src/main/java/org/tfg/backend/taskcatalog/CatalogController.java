package org.tfg.backend.taskcatalog;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controlador REST que expone los endpoints para la visualización, creación,
 * actualización y eliminación de categorías y tareas del catálogo del taller.
 */
@RestController
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
public class CatalogController {

    private final CatalogService catalogService;

    /**
     * Obtiene el listado de categorías y tareas del catálogo de un taller específico.
     *
     * @param workshopId Identificador único del taller.
     * @return Respuesta HTTP con la lista de categorías del catálogo.
     */
    @GetMapping("/workshop/{workshopId}")
    public ResponseEntity<List<CatalogCategory>> getCatalog(@PathVariable UUID workshopId) {
        return ResponseEntity.ok(catalogService.getCatalog(workshopId));
    }

    /**
     * Registra una nueva categoría de tareas personalizada para un taller.
     *
     * @param workshopId Identificador único del taller.
     * @param body Mapa que contiene el nombre visual de la categoría ('displayName').
     * @return Respuesta HTTP con la categoría recién creada.
     */
    @PostMapping("/workshop/{workshopId}/categories")
    public ResponseEntity<CatalogCategory> createCategory(
            @PathVariable UUID workshopId,
            @RequestBody Map<String, String> body) {
        String displayName = body.get("displayName");
        if (displayName == null || displayName.trim().isEmpty()) {
            throw new RuntimeException("El nombre legible de la categoría es obligatorio");
        }
        return ResponseEntity.ok(catalogService.createCategory(workshopId, displayName));
    }

    /**
     * Registra una nueva tarea dentro de una categoría del catálogo del taller.
     *
     * @param workshopId Identificador único del taller.
     * @param categoryId Identificador único de la categoría.
     * @param taskDto DTO con los detalles de la tarea a crear (nombre, horas estimadas, etc.).
     * @return Respuesta HTTP con la tarea creada.
     */
    @PostMapping("/workshop/{workshopId}/categories/{categoryId}/tasks")
    public ResponseEntity<CatalogTask> createTask(
            @PathVariable UUID workshopId,
            @PathVariable UUID categoryId,
            @RequestBody CatalogTask taskDto) {
        return ResponseEntity.ok(catalogService.createTask(workshopId, categoryId, taskDto));
    }

    /**
     * Modifica los datos de una tarea del catálogo existente.
     *
     * @param taskId Identificador único de la tarea a actualizar.
     * @param taskDto Datos nuevos para actualizar la tarea.
     * @return Respuesta HTTP con la tarea actualizada.
     */
    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<CatalogTask> updateTask(
            @PathVariable UUID taskId,
            @RequestBody CatalogTask taskDto) {
        return ResponseEntity.ok(catalogService.updateTask(taskId, taskDto));
    }

    /**
     * Elimina una tarea de catálogo del sistema.
     *
     * @param taskId Identificador de la tarea a borrar.
     * @return Respuesta HTTP vacía indicando éxito.
     */
    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID taskId) {
        catalogService.deleteTask(taskId);
        return ResponseEntity.ok().build();
    }
}
