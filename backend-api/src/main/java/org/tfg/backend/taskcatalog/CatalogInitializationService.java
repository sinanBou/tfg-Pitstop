package org.tfg.backend.taskcatalog;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.workshop.Workshop;

import java.io.InputStream;
import java.util.Iterator;
import java.util.Map;

/**
 * Servicio encargado de la inicialización por defecto del catálogo de tareas y categorías
 * de trabajo para un taller. Carga la información estructurada desde un archivo JSON estático (cargaTrabajo.json)
 * y la mapea a la base de datos relacional para el taller especificado.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CatalogInitializationService {

    private final TaskCategoryRepository categoryRepository;
    private final CatalogTaskRepository taskRepository;
    private final ObjectMapper objectMapper;

    private static final Map<String, String> CATEGORY_DISPLAY_NAMES = Map.ofEntries(
            Map.entry("1_consumibles", "Consumibles"),
            Map.entry("2_sistema_refrigeracion", "Sistema Refrigeración"),
            Map.entry("3_sistema_lubrificacion", "Sistema Lubricación"),
            Map.entry("4_sistema_aire_y_escape", "Sistema Aire y Escape"),
            Map.entry("5_sistema_combustible", "Sistema Combustible"),
            Map.entry("6_sistema_electrico", "Sistema Eléctrico"),
            Map.entry("7_sistema_mecanico", "Sistema Mecánico"),
            Map.entry("8_sistema_gas", "Sistema Gas"),
            Map.entry("alternadores", "Alternadores"),
            Map.entry("controlador", "Controlador"),
            Map.entry("tareas_diversas", "Tareas Diversas"),
            Map.entry("neumaticos_y_ruedas", "Neumáticos y Ruedas")
    );

    /**
     * Carga e inicializa el catálogo de tareas base a partir del JSON estático 'cargaTrabajo.json'
     * y las vincula al taller provisto.
     *
     * @param workshop Taller que recibirá el catálogo inicial.
     */
    @Transactional
    public void initializeCatalogForWorkshop(Workshop workshop) {
        log.info("Inicializando catálogo de tareas por defecto para el taller: {}", workshop.getCompanyName());
        try {
            ClassPathResource resource = new ClassPathResource("cargaTrabajo.json");
            try (InputStream is = resource.getInputStream()) {
                JsonNode root = objectMapper.readTree(is);
                JsonNode servicios = root.get("servicios");
                if (servicios != null) {
                    Iterator<Map.Entry<String, JsonNode>> fields = servicios.fields();
                    while (fields.hasNext()) {
                        Map.Entry<String, JsonNode> field = fields.next();
                        String key = field.getKey();
                        JsonNode value = field.getValue();

                        if ("motores".equals(key)) {
                            Iterator<Map.Entry<String, JsonNode>> motorFields = value.fields();
                            while (motorFields.hasNext()) {
                                Map.Entry<String, JsonNode> motorField = motorFields.next();
                                createCategoryAndTasks(motorField.getKey(), motorField.getValue(), workshop);
                            }
                        } else {
                            createCategoryAndTasks(key, value, workshop);
                        }
                    }
                }
            }
            log.info("Catálogo inicializado con éxito para el taller: {}", workshop.getCompanyName());
        } catch (Exception e) {
            log.error("Error al inicializar el catálogo de tareas para el taller {}", workshop.getCompanyName(), e);
            throw new RuntimeException("No se pudo cargar el catálogo de tareas por defecto", e);
        }
    }

    /**
     * Helper que procesa una sección de tareas de un archivo JSON, crea la categoría
     * correspondiente si es necesario y guarda todas sus tareas asociadas.
     *
     * @param categoryKey Identificador único clave de la categoría.
     * @param tasksArray Nodo JSON array que contiene las tareas de la categoría.
     * @param workshop Taller asociado.
     */
    private void createCategoryAndTasks(String categoryKey, JsonNode tasksArray, Workshop workshop) {
        String displayName = CATEGORY_DISPLAY_NAMES.getOrDefault(categoryKey, categoryKey);
        
        TaskCategory category = TaskCategory.builder()
                .name(categoryKey)
                .displayName(displayName)
                .workshop(workshop)
                .build();

        category = categoryRepository.save(category);

        if (tasksArray.isArray()) {
            for (JsonNode taskNode : tasksArray) {
                CatalogTask task = CatalogTask.builder()
                        .category(category)
                        .code(taskNode.get("codigo").asText())
                        .name(taskNode.get("tarea").asText())
                        .hours(taskNode.has("horas") && !taskNode.get("horas").isNull() ? taskNode.get("horas").asDouble() : null)
                        .hours4Cil(taskNode.has("horas_4_cil") && !taskNode.get("horas_4_cil").isNull() ? taskNode.get("horas_4_cil").asDouble() : null)
                        .hoursCilExtra(taskNode.has("horas_cil_extra") && !taskNode.get("horas_cil_extra").isNull() ? taskNode.get("horas_cil_extra").asDouble() : null)
                        .hours1Rueda(taskNode.has("horas_1_rueda") && !taskNode.get("horas_1_rueda").isNull() ? taskNode.get("horas_1_rueda").asDouble() : null)
                        .build();

                taskRepository.save(task);
            }
        }
    }
}