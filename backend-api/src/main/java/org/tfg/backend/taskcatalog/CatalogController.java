package org.tfg.backend.taskcatalog;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
public class CatalogController {

    private final CatalogService catalogService;

    /**
    * Obtiene el listado de categorÃ­as y tareas del catÃ¡logo de un taller especÃ­fico.
    *
    * @param workshopId Identificador Ãºnico del taller.
    * @return Respuesta HTTP con la lista de categorÃ­as del catÃ¡logo.
    */
    @GetMapping("/workshop/{workshopId}")
    public ResponseEntity<List<TaskCategory>> getCatalog(@PathVariable UUID workshopId) {
        return ResponseEntity.ok(catalogService.getCatalog(workshopId));
    }

    /**
    * Registra una nueva categorÃ­a de tareas personalizada para un taller.
    *
    * @param workshopId Identificador Ãºnico del taller.
    * @param body Mapa que contiene el nombre visual de la categorÃ­a ('displayName').
    * @return Respuesta HTTP con la categorÃ­a reciÃ©n creada.
    */
    @PostMapping("/workshop/{workshopId}/categories")
    public ResponseEntity<TaskCategory> createCategory(
            @PathVariable UUID workshopId,
            @RequestBody Map<String, String> body) {
        String displayName = body.get("displayName");
        if (displayName == null || displayName.trim().isEmpty()) {
            throw new RuntimeException("El nombre legible de la categoría es obligatorio");
        /**
        * Registra una nueva tarea dentro de una categorÃ­a del catÃ¡logo del taller.
        *
        * @param workshopId Identificador Ãºnico del taller.
        * @param categoryId Identificador Ãºnico de la categorÃ­a.
        * @param taskDto DTO con los detalles de la tarea a crear (nombre, horas estimadas, etc.).
        * @return Respuesta HTTP con la tarea creada.
        */
        }
        return ResponseEntity.ok(catalogService.createCategory(workshopId, displayName));
    }

    @PostMapping("/workshop/{workshopId}/categories/{categoryId}/tasks")
    public ResponseEntity<CatalogTask> createTask(
            @PathVariable UUID workshopId,
            @PathVariable UUID categoryId,
            @RequestBody CatalogTask taskDto) {
        return ResponseEntity.ok(catalogService.createTask(workshopId, categoryId, taskDto));
    /**
    * Modifica los datos de una tarea del catÃ¡logo existente.
    *
    * @param taskId Identificador Ãºnico de la tarea a actualizar.
    * @param taskDto Datos nuevos para actualizar la tarea.
    * @return Respuesta HTTP con la tarea actualizada.
    */
    }

    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<CatalogTask> updateTask(
            @PathVariable UUID taskId,
            @RequestBody CatalogTask taskDto) {
        return ResponseEntity.ok(catalogService.updateTask(taskId, taskDto));
    /**
    * Elimina una tarea de catÃ¡logo del sistema.
    *
    * @param taskId Identificador de la tarea a borrar.
    * @return Respuesta HTTP vacÃ­a indicando Ã©xito.
    */
    }

    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID taskId) {
        catalogService.deleteTask(taskId);
        return ResponseEntity.ok().build();
    /**
    * Obtiene el listado de categorías y tareas del catálogo de un taller específico.
    *
    * @param workshopId Identificador único del taller.
    * @return Respuesta HTTP con la lista de categorías del catálogo.
    */
    }

    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID categoryId) {
        catalogService.deleteCategory(categoryId);
        return ResponseEntity.ok().build();
    /**
    * Registra una nueva categoría de tareas personalizada para un taller.
    *
    * @param workshopId Identificador único del taller.
    * @param body Mapa que contiene el nombre visual de la categoría ('displayName').
    * @return Respuesta HTTP con la categoría recién creada.
    */
    }
}