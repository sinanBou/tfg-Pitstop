package org.tfg.backend.taskcatalog;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.workshop.Workshop;
import org.tfg.backend.workshop.WorkshopRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Servicio encargado de gestionar el catálogo de tareas y categorías de servicios del taller.
 * Permite buscar categorías, dar de alta nuevas categorías personalizadas, crear tareas dentro de una categoría,
 * actualizar los tiempos y borrar tareas o categorías vacías.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CatalogService {

    private final TaskCategoryRepository categoryRepository;
    private final CatalogTaskRepository taskRepository;
    private final WorkshopRepository workshopRepository;

    /**
     * Obtiene el listado completo de categorías y tareas del catálogo asociadas al taller dado.
     *
     * @param workshopId Identificador único del taller.
     * @return Lista de categorías con sus respectivas tareas del catálogo cargadas.
     */
    @Transactional(readOnly = true)
    public List<TaskCategory> getCatalog(UUID workshopId) {
        return categoryRepository.findByWorkshopIdOrderByNameAsc(workshopId);
    }

    /**
     * Crea una categoría de tareas dentro del catálogo de un taller, asegurando un nombre técnico único.
     *
     * @param workshopId Identificador único del taller.
     * @param displayName Nombre visible para mostrar en el frontend.
     * @return La categoría creada.
     * @throws RuntimeException si el taller no existe.
     */
    @Transactional
    public TaskCategory createCategory(UUID workshopId, String displayName) {
        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));

        // Generar un nombre/clave único basado en el displayName
        String name = displayName.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", "_");

        if (name.isEmpty()) {
            name = "categoria_nueva";
        }

        // Si ya existe una categoría con esa clave para este taller, añadimos sufijo numérico
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

    /**
     * Registra una nueva tarea dentro de una categoría del catálogo, autogenerando el código secuencial si no se provee.
     *
     * @param workshopId Identificador único del taller.
     * @param categoryId Identificador único de la categoría.
     * @param taskDto DTO con la información de la tarea.
     * @return La tarea creada e insertada en la base de datos.
     * @throws RuntimeException si la categoría no existe o no pertenece al taller especificado.
     */
    @Transactional
    public CatalogTask createTask(UUID workshopId, UUID categoryId, CatalogTask taskDto) {
        TaskCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        if (!category.getWorkshop().getId().equals(workshopId)) {
            throw new RuntimeException("Acceso denegado: la categoría no pertenece a este taller");
        }

        String code = taskDto.getCode();
        if (code == null || code.trim().isEmpty()) {
            // Autogenerar código secuencial
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

    /**
     * Modifica los datos (nombre y tiempos estimados de ejecución) de una tarea existente.
     *
     * @param taskId Identificador único de la tarea.
     * @param taskDto Datos nuevos.
     * @return La tarea de catálogo modificada y persistida.
     * @throws RuntimeException si la tarea no se encuentra.
     */
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

    /**
     * Elimina una tarea de catálogo del sistema.
     *
     * @param taskId Identificador único de la tarea.
     * @throws RuntimeException si la tarea no se encuentra.
     */
    @Transactional
    public void deleteTask(UUID taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new RuntimeException("Tarea no encontrada");
        }
        taskRepository.deleteById(taskId);
    }

    /**
     * Elimina una categoría del catálogo si y solo si no contiene ninguna tarea vinculada.
     *
     * @param categoryId Identificador único de la categoría.
     * @throws RuntimeException si la categoría no existe o tiene tareas asociadas.
     */
    @Transactional
    public void deleteCategory(UUID categoryId) {
        TaskCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        if (!category.getTasks().isEmpty()) {
            throw new RuntimeException("No se puede eliminar la categoría porque contiene tareas");
        }
        categoryRepository.delete(category);
    }

    private String generateNextCode(TaskCategory category) {
        List<CatalogTask> tasks = category.getTasks();
        if (tasks == null || tasks.isEmpty()) {
            // Si la categoría tiene un prefijo numérico (ej. "12_neumaticos"), usamos ese prefijo
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
     * Helper que extrae el prefijo numérico inicial de un nombre de categoría.
     *
     * @param categoryName Nombre técnico de la categoría.
     * @return El prefijo numérico como cadena o un hash ligero si no posee números.
     */
    private String extractNumericPrefix(String categoryName) {
        // Busca si el nombre de la categoría empieza por número seguido de guión (ej: "1_consumibles" -> "1")
        if (categoryName.contains("_")) {
            String firstPart = categoryName.split("_")[0];
            try {
                Integer.parseInt(firstPart);
                return firstPart;
            } catch (NumberFormatException ignored) {}
        }
        // Si no empieza por número, devolvemos un hash ligero
        return String.valueOf(Math.abs(categoryName.hashCode() % 100));
    }
}