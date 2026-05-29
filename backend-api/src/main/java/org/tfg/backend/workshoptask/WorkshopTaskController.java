package org.tfg.backend.workshoptask;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.tfg.backend.workshoptask.service.WorkshopTaskAdminService;
import org.tfg.backend.workshoptask.service.WorkshopTaskLookupService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workshop-tasks")
@RequiredArgsConstructor
public class WorkshopTaskController {

    private final WorkshopTaskAdminService taskAdminService;
    private final WorkshopTaskLookupService taskLookupService;

    @GetMapping("/workshop/{workshopId}")
    public List<WorkshopTaskDTO> getWorkshopTasks(
            @PathVariable UUID workshopId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);
        return taskLookupService.getTasksByWorkshopAndDate(workshopId, start, end);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<WorkshopTaskDTO> updateTask(@PathVariable UUID id, @RequestBody WorkshopTaskDTO dto) {
        return ResponseEntity.ok(taskAdminService.updateTask(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID id) {
        taskAdminService.deleteTask(id);
        return ResponseEntity.ok().build();
    }
}
