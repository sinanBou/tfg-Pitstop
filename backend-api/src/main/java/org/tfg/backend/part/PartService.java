package org.tfg.backend.part;

import jakarta.annotation.PostConstruct;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Servicio de negocio encargado de coordinar la lógica del catálogo de repuestos, el inventario del almacén,
 * las categorías asociadas y el control de existencias. Sincroniza la asignación de repuestos a citas,
 * recalculando costes y publicando alertas de bajo stock mediante eventos.
 */
@Service
public class PartService {

    private final PartCatalogRepository partCatalogRepository;
    private final WorkshopInventoryRepository workshopInventoryRepository;
    private final AppointmentPartRepository appointmentPartRepository;
    private final AppointmentRepository appointmentRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final PartCategoryRepository partCategoryRepository;

    /**
     * Construye el servicio de repuestos con sus respectivos repositorios y publicador de eventos.
     *
     * @param partCatalogRepository Repositorio del catálogo de repuestos.
     * @param workshopInventoryRepository Repositorio de inventario del almacén.
     * @param appointmentPartRepository Repositorio de la relación cita-repuesto.
     * @param appointmentRepository Repositorio de citas.
     * @param eventPublisher Publicador de eventos de la aplicación.
     * @param partCategoryRepository Repositorio de categorías de repuestos.
     */
    public PartService(PartCatalogRepository partCatalogRepository,
                       WorkshopInventoryRepository workshopInventoryRepository,
                       AppointmentPartRepository appointmentPartRepository,
                       AppointmentRepository appointmentRepository,
                       ApplicationEventPublisher eventPublisher,
                       PartCategoryRepository partCategoryRepository) {
        this.partCatalogRepository = partCatalogRepository;
        this.workshopInventoryRepository = workshopInventoryRepository;
        this.appointmentPartRepository = appointmentPartRepository;
        this.appointmentRepository = appointmentRepository;
        this.eventPublisher = eventPublisher;
        this.partCategoryRepository = partCategoryRepository;
    }

    /**
     * Busca una categoría por su nombre normalizado (slug) o la crea si no existe.
     *
     * @param displayName Nombre a mostrar de la categoría.
     * @return La categoría encontrada o creada.
     */
    private PartCategory findOrCreateCategory(String displayName) {
        String slug = displayName.toLowerCase().trim()
                .replace(" ", "_")
                .replace("á", "a")
                .replace("é", "e")
                .replace("í", "i")
                .replace("ó", "o")
                .replace("ú", "u");
        return partCategoryRepository.findByName(slug)
                .orElseGet(() -> {
                    PartCategory newCat = PartCategory.builder()
                            .name(slug)
                            .displayName(displayName)
                            .build();
                    return partCategoryRepository.save(newCat);
                });
    }

    /**
     * Asegura la existencia de la categoría protegida para repuestos personalizados.
     */
    @PostConstruct
    @Transactional
    public void ensureFixedCategoryExists() {
        findOrCreateCategory("Recambios personalizados");
    }

    /**
     * Inicializa repuestos y categorías de demostración en el catálogo y almacén
     * si la base de datos se encuentra vacía al arrancar la aplicación.
     */
    @PostConstruct
    @Transactional
    public void initDemoParts() {
        if (partCatalogRepository.count() > 0) return;

        // Create Demo Parts in Catalog & Inventory
        createPartDemo("REF-1020", "Pastillas de freno Brembo", "Brembo", "Kit de pastillas de alto rendimiento", "Frenos", 45.0, 75.0, 5);
        createPartDemo("REF-3040", "Filtro de aceite Bosch", "Bosch", "Filtro purificador metálico", "Filtros", 8.0, 15.0, 10);
        createPartDemo("REF-5060", "Aceite Castrol EDGE 5W-30", "Castrol", "Garrafa de 5 litros de aceite sintético", "Lubricantes", 25.0, 48.0, 3);
        createPartDemo("REF-7080", "Filtro de aire Bosch", "Bosch", "Filtro de cabina lavable", "Filtros", 12.0, 22.0, 5);
        createPartDemo("REF-9010", "Bujía NGK Iridium", "NGK", "Bujía de alto rendimiento de iridio", "Encendido", 6.5, 12.0, 12);
    }

    /**
     * Crea un repuesto auxiliar en catálogo e inventario para propósitos de prueba o demostración.
     */
    private void createPartDemo(String oemRef, String name, String manufacturer, String specs, String categoryName,
                                double costPrice, double retailPrice, int stock) {
        PartCategory category = findOrCreateCategory(categoryName);
        PartCatalog part = PartCatalog.builder()
                .oemReference(oemRef)
                .name(name)
                .manufacturer(manufacturer)
                .technicalSpecs(specs)
                .category(category)
                .build();
        partCatalogRepository.save(part);

        WorkshopInventory inventory = WorkshopInventory.builder()
                .part(part)
                .stockQuantity(stock)
                .costPrice(costPrice)
                .retailPrice(retailPrice)
                .avisoThreshold(5) // Lanza aviso si baja a 5 unidades o menos
                .build();
        workshopInventoryRepository.save(inventory);
    }

    /**
     * Recupera todos los artículos registrados en el catálogo general.
     *
     * @return Lista de todos los repuestos del catálogo.
     */
    public List<PartCatalog> getAllCatalog() {
        return partCatalogRepository.findAll();
    }

    /**
     * Recupera todos los registros de inventario (existencias) del taller.
     *
     * @return Lista de artículos en inventario.
     */
    public List<WorkshopInventory> getAllInventory() {
        return workshopInventoryRepository.findAll();
    }

    /**
     * Obtiene los repuestos asignados a una cita específica.
     *
     * @param appointmentId Identificador único de la cita.
     * @return Lista de relaciones cita-repuesto.
     */
    public List<AppointmentPart> getPartsByAppointment(UUID appointmentId) {
        return appointmentPartRepository.findByAppointmentId(appointmentId);
    }

    /**
     * Asigna un repuesto del inventario a una cita aplicando una estrategia de precios y descontando
     * el stock disponible. Publica un evento de alerta si las existencias caen por debajo del umbral de aviso.
     *
     * @param appointmentId Identificador único de la cita.
     * @param partId Identificador único del repuesto.
     * @param quantity Cantidad a asignar.
     * @param pricingStrategy Estrategia dinámica de cálculo de precio.
     * @return El registro de asociación intermedia {@link AppointmentPart}.
     */
    @Transactional
    public AppointmentPart assignPartToAppointment(UUID appointmentId, UUID partId, int quantity, PartPricingStrategy pricingStrategy) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        PartCatalog part = partCatalogRepository.findById(partId)
                .orElseThrow(() -> new RuntimeException("Pieza no encontrada en catálogo"));

        WorkshopInventory inventory = workshopInventoryRepository.findByPartId(partId)
                .orElseThrow(() -> new RuntimeException("Pieza no disponible en inventario del taller"));

        if (inventory.getStockQuantity() < quantity) {
            throw new RuntimeException("Stock insuficiente en almacén. Unidades disponibles: " + inventory.getStockQuantity());
        }

        // 1. Descontar del almacén
        inventory.setStockQuantity(inventory.getStockQuantity() - quantity);
        workshopInventoryRepository.save(inventory);

        // 2. Comprobar alerta de stock bajo (Observer Event Trigger)
        if (inventory.getStockQuantity() <= inventory.getAvisoThreshold()) {
            eventPublisher.publishEvent(new LowStockEvent(this, part.getId(), part.getName(), inventory.getStockQuantity(), inventory.getAvisoThreshold()));
        }

        // 3. Calcular precio aplicado según la estrategia dinámica
        double finalPrice = pricingStrategy.calculatePrice(inventory.getRetailPrice());

        // 4. Crear o acumular en la relación intermedia
        Optional<AppointmentPart> existingOpt = appointmentPartRepository.findByAppointmentIdAndPartId(appointmentId, partId);
        AppointmentPart appointmentPart;
        if (existingOpt.isPresent()) {
            appointmentPart = existingOpt.get();
            appointmentPart.setQuantityUsed(appointmentPart.getQuantityUsed() + quantity);
            appointmentPart.setAppliedPrice(finalPrice);
        } else {
            appointmentPart = AppointmentPart.builder()
                    .appointment(appointment)
                    .part(part)
                    .quantityUsed(quantity)
                    .appliedPrice(finalPrice)
                    .build();
        }

        AppointmentPart saved = appointmentPartRepository.save(appointmentPart);

        // 5. Sincronizar el coste de la cita
        recalculateAppointmentTotal(appointment);

        return saved;
    }

    /**
     * Asigna un repuesto personalizado genérico (sin stock inicial) a una cita específica, creándolo en catálogo
     * con precio provisional o pendiente.
     *
     * @param appointmentId Identificador único de la cita.
     * @param customName Nombre descriptivo del repuesto personalizado.
     * @param quantity Cantidad a asignar.
     * @return El registro de asociación de repuesto en la cita.
     */
    @Transactional
    public AppointmentPart assignCustomPartToAppointment(UUID appointmentId, String customName, int quantity) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        PartCategory category = findOrCreateCategory("Recambios personalizados");

        PartCatalog part = partCatalogRepository.findByName(customName.trim())
                .stream().findFirst().orElseGet(() -> {
                    PartCatalog p = PartCatalog.builder()
                            .name(customName.trim())
                            .manufacturer("Genérico")
                            .category(category)
                            .build();
                    return partCatalogRepository.save(p);
                });

        WorkshopInventory inventory = workshopInventoryRepository.findByPartId(part.getId())
                .orElseGet(() -> {
                    WorkshopInventory inv = WorkshopInventory.builder()
                            .part(part)
                            .stockQuantity(0)
                            .costPrice(0.0)
                            .retailPrice(0.0)
                            .avisoThreshold(0)
                            .build();
                    return workshopInventoryRepository.save(inv);
                });

        Optional<AppointmentPart> existingOpt = appointmentPartRepository.findByAppointmentIdAndPartId(appointmentId, part.getId());
        AppointmentPart appointmentPart;
        if (existingOpt.isPresent()) {
            appointmentPart = existingOpt.get();
            appointmentPart.setQuantityUsed(appointmentPart.getQuantityUsed() + quantity);
        } else {
            appointmentPart = AppointmentPart.builder()
                    .appointment(appointment)
                    .part(part)
                    .quantityUsed(quantity)
                    .appliedPrice(0.0) // 0.0 represents pending price
                    .build();
        }

        AppointmentPart saved = appointmentPartRepository.save(appointmentPart);
        recalculateAppointmentTotal(appointment);
        return saved;
    }

    /**
     * Retira un repuesto previamente asignado a una cita médica/taller y restaura el stock consumido en el inventario.
     *
     * @param appointmentId Identificador único de la cita.
     * @param partId Identificador único del repuesto.
     */
    @Transactional
    public void removePartFromAppointment(UUID appointmentId, UUID partId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        AppointmentPart appointmentPart = appointmentPartRepository.findByAppointmentIdAndPartId(appointmentId, partId)
                .orElseThrow(() -> new RuntimeException("La pieza no está asignada a esta cita"));

        // Devuelve el stock al almacén
        Optional<WorkshopInventory> inventoryOpt = workshopInventoryRepository.findByPartId(partId);
        if (inventoryOpt.isPresent()) {
            WorkshopInventory inventory = inventoryOpt.get();
            inventory.setStockQuantity(inventory.getStockQuantity() + appointmentPart.getQuantityUsed());
            workshopInventoryRepository.save(inventory);
        }

        // Borrar relación
        appointmentPartRepository.delete(appointmentPart);

        // Sincronizar el coste de la cita
        recalculateAppointmentTotal(appointment);
    }

    /**
     * Recalcula el coste total acumulado de una cita sumando el coste estimado de la mano de obra del taller
     * y de todos los repuestos asignados en ese momento.
     *
     * @param appointment Entidad de la cita a recalcular.
     */
    @Transactional
    public void recalculateAppointmentTotal(Appointment appointment) {
        // Horas estimadas del mecánico
        double durationHours = (appointment.getEstimatedDuration() != null ? appointment.getEstimatedDuration() : 0) / 60.0;
        double hourlyRate = appointment.getWorkshop() != null && appointment.getWorkshop().getHourlyRate() != null
                ? appointment.getWorkshop().getHourlyRate() : 50.0;
        double laborCost = durationHours * hourlyRate;

        // Sumar coste de repuestos asignados
        List<AppointmentPart> parts = appointmentPartRepository.findByAppointmentId(appointment.getId());
        double partsCost = parts.stream()
                .mapToDouble(p -> p.getAppliedPrice() * p.getQuantityUsed())
                .sum();

        // Guardar coste recalculado
        // Nota: en DTO calculamos dinámicamente o actualizamos precio si fuera necesario
    }

    /**
     * Registra un nuevo repuesto en el catálogo general del sistema y crea su correspondiente stock inicial
     * en el inventario de almacén del taller.
     *
     * @param oemReference Código o referencia original del fabricante (OEM).
     * @param name Nombre comercial o descripción corta.
     * @param manufacturer Nombre del fabricante.
     * @param technicalSpecs Ficha o especificaciones técnicas del repuesto.
     * @param categoryId Identificador único de la categoría.
     * @param costPrice Precio de costo de adquisición.
     * @param retailPrice Precio de venta sugerido al público.
     * @param stockQuantity Unidades físicas disponibles en almacén.
     * @param avisoThreshold Umbral para alerta de stock bajo.
     * @return El objeto de inventario {@link WorkshopInventory} guardado en base de datos.
     */
    @Transactional
    public WorkshopInventory addPartToInventory(String oemReference, String name, String manufacturer, String technicalSpecs, UUID categoryId,
                                                double costPrice, double retailPrice, int stockQuantity, int avisoThreshold) {
        PartCategory category = partCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        String cleanOem = (oemReference != null && !oemReference.trim().isEmpty()) ? oemReference.trim() : null;

        PartCatalog part = null;
        if (cleanOem != null) {
            part = partCatalogRepository.findByOemReference(cleanOem).orElse(null);
        }

        if (part == null) {
            part = PartCatalog.builder()
                    .oemReference(cleanOem)
                    .name(name)
                    .manufacturer(manufacturer)
                    .technicalSpecs(technicalSpecs)
                    .category(category)
                    .build();
            partCatalogRepository.save(part);
        }

        WorkshopInventory inventory = WorkshopInventory.builder()
                .part(part)
                .stockQuantity(stockQuantity)
                .costPrice(costPrice)
                .retailPrice(retailPrice)
                .avisoThreshold(avisoThreshold)
                .build();
        return workshopInventoryRepository.save(inventory);
    }

    /**
     * Actualiza los campos descriptivos de catálogo y las existencias o precios de un artículo de inventario.
     * Si el artículo tenía asignaciones pendientes (con precio 0.0), se actualizan con el nuevo precio de venta.
     *
     * @param inventoryId Identificador único de inventario.
     * @param oemReference Nueva referencia OEM.
     * @param name Nuevo nombre comercial.
     * @param manufacturer Nuevo fabricante.
     * @param technicalSpecs Nuevas especificaciones técnicas.
     * @param categoryId Identificador de la nueva categoría.
     * @param costPrice Nuevo precio de costo.
     * @param retailPrice Nuevo precio de venta al público.
     * @param stockQuantity Nueva cantidad disponible.
     * @param avisoThreshold Nuevo umbral de aviso.
     * @return El registro de inventario actualizado {@link WorkshopInventory}.
     */
    @Transactional
    public WorkshopInventory updateInventoryItem(UUID inventoryId, String oemReference, String name, String manufacturer, String technicalSpecs, UUID categoryId,
                                                 double costPrice, double retailPrice, int stockQuantity, int avisoThreshold) {
        WorkshopInventory inventory = workshopInventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("Pieza de inventario no encontrada"));

        PartCategory category = partCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        String cleanOem = (oemReference != null && !oemReference.trim().isEmpty()) ? oemReference.trim() : null;

        PartCatalog part = inventory.getPart();
        part.setOemReference(cleanOem);
        part.setName(name);
        part.setManufacturer(manufacturer);
        part.setTechnicalSpecs(technicalSpecs);
        part.setCategory(category);
        partCatalogRepository.save(part);

        inventory.setStockQuantity(stockQuantity);
        inventory.setCostPrice(costPrice);
        inventory.setRetailPrice(retailPrice);
        inventory.setAvisoThreshold(avisoThreshold);

        // Actualizar el precio de venta en las asignaciones de esta pieza que tengan precio pendiente (0.0 o null)
        List<AppointmentPart> appParts = appointmentPartRepository.findByPartId(part.getId());
        for (AppointmentPart ap : appParts) {
            if (ap.getAppliedPrice() == null || ap.getAppliedPrice() <= 0.0) {
                ap.setAppliedPrice(retailPrice);
                appointmentPartRepository.save(ap);
                recalculateAppointmentTotal(ap.getAppointment());
            }
        }

        return workshopInventoryRepository.save(inventory);
    }

    /**
     * Elimina el registro del almacén y del catálogo general para una pieza dada, removiendo antes
     * cualquier vinculación histórica de la misma a las citas del taller.
     *
     * @param inventoryId Identificador único del registro de inventario.
     */
    @Transactional
    public void deleteInventoryItem(UUID inventoryId) {
        WorkshopInventory inventory = workshopInventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("Pieza de inventario no encontrada"));

        List<AppointmentPart> appParts = appointmentPartRepository.findByPartId(inventory.getPart().getId());
        appointmentPartRepository.deleteAll(appParts);

        workshopInventoryRepository.delete(inventory);
        partCatalogRepository.delete(inventory.getPart());
    }

    /**
     * Crea y guarda una nueva categoría de repuestos en el sistema a partir de su nombre descriptivo,
     * validando que no se duplique su slug.
     *
     * @param displayName Nombre a mostrar de la categoría.
     * @return La categoría creada.
     */
    @Transactional
    public PartCategory createCategory(String displayName) {
        String slug = displayName.toLowerCase().trim()
                .replace(" ", "_")
                .replace("á", "a")
                .replace("é", "e")
                .replace("í", "i")
                .replace("ó", "o")
                .replace("ú", "u");
        if (partCategoryRepository.findByName(slug).isPresent()) {
            throw new RuntimeException("Ya existe una categoría con este nombre");
        }
        PartCategory newCat = PartCategory.builder()
                .name(slug)
                .displayName(displayName)
                .build();
        return partCategoryRepository.save(newCat);
    }

    /**
     * Recupera todas las categorías de repuestos registradas en la aplicación.
     *
     * @return Lista de categorías.
     */
    public List<PartCategory> getAllCategories() {
        return partCategoryRepository.findAll();
    }

    /**
     * Elimina una categoría específica siempre que no sea protegida y no contenga artículos del catálogo vinculados.
     *
     * @param categoryId Identificador único de la categoría.
     */
    @Transactional
    public void deleteCategory(UUID categoryId) {
        PartCategory category = partCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        if ("recambios_personalizados".equals(category.getName()) || "recambios_peronalizados".equals(category.getName())) {
            throw new RuntimeException("La categoría 'Recambios personalizados' es fija y no se puede eliminar");
        }
        if (!category.getParts().isEmpty()) {
            throw new RuntimeException("No se puede eliminar una categoría que contiene repuestos");
        }
        partCategoryRepository.delete(category);
    }
}
