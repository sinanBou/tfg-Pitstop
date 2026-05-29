package org.tfg.backend.taskcatalog;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.tfg.backend.taskcatalog.service.CatalogAdminService;
import org.tfg.backend.taskcatalog.service.CatalogLookupService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
public class CatalogController {

    private final CatalogAdminService catalogAdminService;
    private final CatalogLookupService catalogLookupService;

    @GetMapping("/workshop/{workshopId}")
    public ResponseEntity<List<CatalogCategory>> getCatalog(@PathVariable UUID workshopId) {
        return ResponseEntity.ok(catalogLookupService.getCatalog(workshopId));
    }

    @PostMapping("/workshop/{workshopId}/categories")
    public ResponseEntity<CatalogCategory> createCategory(
            @PathVariable UUID workshopId,
            @RequestBody Map<String, String> body) {
        String displayName = body.get("displayName");
        if (displayName == null || displayName.trim().isEmpty()) {
            throw new RuntimeException("El nombre legible de la categoría es obligatorio");
        }
        return ResponseEntity.ok(catalogAdminService.createCategory(workshopId, displayName));
    }

    @PostMapping("/workshop/{workshopId}/categories/{categoryId}/tasks")
    public ResponseEntity<CatalogTask> createTask(
            @PathVariable UUID workshopId,
            @PathVariable UUID categoryId,
            @RequestBody CatalogTask taskDto) {
        return ResponseEntity.ok(catalogAdminService.createTask(workshopId, categoryId, taskDto));
    }

    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<CatalogTask> updateTask(
            @PathVariable UUID taskId,
            @RequestBody CatalogTask taskDto) {
        return ResponseEntity.ok(catalogAdminService.updateTask(taskId, taskDto));
    }

    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID taskId) {
        catalogAdminService.deleteTask(taskId);
        return ResponseEntity.ok().build();
    }
}
