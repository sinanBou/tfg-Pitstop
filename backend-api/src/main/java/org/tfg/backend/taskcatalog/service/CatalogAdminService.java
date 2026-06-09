package org.tfg.backend.taskcatalog.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.taskcatalog.*;
import org.tfg.backend.workshop.Workshop;
import org.tfg.backend.workshop.WorkshopRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CatalogAdminService {

    private final TaskCategoryRepository categoryRepository;
    private final CatalogTaskRepository taskRepository;
    private final WorkshopRepository workshopRepository;

    @Transactional
    public TaskCategory createCategory(UUID workshopId, String displayName) {
        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));

        String name = displayName.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", "_");

        if (name.isEmpty()) {
            name = "categoria_nueva";
        }

        String uniqueName = name;
        int counter = 1;
        while (categoryRepository.existsByWorkshopIdAndName(workshopId, uniqueName)) {
            uniqueName = name + "_" + counter++;
        }

        TaskCategory category = TaskCategory.builder()
                .workshop(workshop)
                .name(uniqueName)
                .displayName(displayName)
                .build();

        return categoryRepository.save(category);
    }

    @Transactional
    public CatalogTask createTask(UUID workshopId, UUID categoryId, CatalogTask taskDto) {
        TaskCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        if (!category.getWorkshop().getId().equals(workshopId)) {
            throw new RuntimeException("Acceso denegado: la categoría no pertenece a este taller");
        }

        String code = taskDto.getCode();
        if (code == null || code.trim().isEmpty()) {
            code = generateNextCode(category);
        }

        CatalogTask task = CatalogTask.builder()
                .category(category)
                .code(code)
                .name(taskDto.getName())
                .hours(taskDto.getHours())
                .hours4Cil(taskDto.getHours4Cil())
                .hoursCilExtra(taskDto.getHoursCilExtra())
                .hours1Rueda(taskDto.getHours1Rueda())
                .build();

        return taskRepository.save(task);
    }

    @Transactional
    public CatalogTask updateTask(UUID taskId, CatalogTask taskDto) {
        CatalogTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Tarea de catálogo no encontrada"));

        if (taskDto.getName() != null) task.setName(taskDto.getName());
        task.setHours(taskDto.getHours());
        task.setHours4Cil(taskDto.getHours4Cil());
        task.setHoursCilExtra(taskDto.getHoursCilExtra());
        task.setHours1Rueda(taskDto.getHours1Rueda());

        return taskRepository.save(task);
    }

    @Transactional
    public void deleteTask(UUID taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new RuntimeException("Tarea no encontrada");
        }
        taskRepository.deleteById(taskId);
    }

    private String generateNextCode(TaskCategory category) {
        List<CatalogTask> tasks = category.getTasks();
        if (tasks == null || tasks.isEmpty()) {
            String prefix = extractNumericPrefix(category.getName());
            return prefix + ".1";
        }

        double maxSuffix = 0.0;
        String prefix = "1";

        for (CatalogTask t : tasks) {
            String c = t.getCode();
            if (c.contains(".")) {
                String[] parts = c.split("\\.");
                prefix = parts[0];
                try {
                    double suffix = Double.parseDouble(parts[1]);
                    if (suffix > maxSuffix) {
                        maxSuffix = suffix;
                    }
                } catch (NumberFormatException ignored) {}
            }
        }

        int nextSuffix = (int) Math.floor(maxSuffix) + 1;
        return prefix + "." + nextSuffix;
    }

    /**
    * Helper que extrae el prefijo numÃ©rico inicial de un nombre de categorÃ­a.
    *
    * @param categoryName Nombre tÃ©cnico de la categorÃ­a.
    * @return El prefijo numÃ©rico como cadena o un hash ligero si no posee nÃºmeros.
    */
    private String extractNumericPrefix(String categoryName) {
        if (categoryName.contains("_")) {
            String firstPart = categoryName.split("_")[0];
            try {
                Integer.parseInt(firstPart);
                return firstPart;
            } catch (NumberFormatException ignored) {}
        }
        return String.valueOf(Math.abs(categoryName.hashCode() % 100));
    }
}