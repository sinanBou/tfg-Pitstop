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

    @GetMapping("/workshop/{workshopId}")
    public ResponseEntity<List<CatalogCategory>> getCatalog(@PathVariable UUID workshopId) {
        return ResponseEntity.ok(catalogService.getCatalog(workshopId));
    }

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

    @PostMapping("/workshop/{workshopId}/categories/{categoryId}/tasks")
    public ResponseEntity<CatalogTask> createTask(
            @PathVariable UUID workshopId,
            @PathVariable UUID categoryId,
            @RequestBody CatalogTask taskDto) {
        return ResponseEntity.ok(catalogService.createTask(workshopId, categoryId, taskDto));
    }

    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<CatalogTask> updateTask(
            @PathVariable UUID taskId,
            @RequestBody CatalogTask taskDto) {
        return ResponseEntity.ok(catalogService.updateTask(taskId, taskDto));
    }

    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID taskId) {
        catalogService.deleteTask(taskId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID categoryId) {
        catalogService.deleteCategory(categoryId);
        return ResponseEntity.ok().build();
    }
}
