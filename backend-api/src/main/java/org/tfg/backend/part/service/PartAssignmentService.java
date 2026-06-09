package org.tfg.backend.part.service;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentRepository;
import org.tfg.backend.part.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Servicio encargado de gestionar la asignación, consumo y retirada de repuestos en las citas del taller.
 * Realiza el control físico de stock del almacén y actualiza el cálculo del coste total acumulado de las citas.
 */
@Service
@RequiredArgsConstructor
public class PartAssignmentService {

    private final PartCatalogRepository partCatalogRepository;
    private final WorkshopInventoryRepository workshopInventoryRepository;
    private final AppointmentPartRepository appointmentPartRepository;
    private final AppointmentRepository appointmentRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final PartCategoryRepository partCategoryRepository;

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
     * Asigna un repuesto específico a una cita médica/taller, reduciendo su stock disponible en el almacén.
     * Publica un evento si las existencias caen por debajo del umbral de seguridad y recalcula el coste de la cita.
     *
     * @param appointmentId Identificador de la cita.
     * @param partId Identificador del repuesto en catálogo.
     * @param quantity Cantidad consumida.
     * @param pricingStrategy Estrategia para determinar el precio final aplicado.
     * @return La relación de asignación generada {@link AppointmentPart}.
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

        inventory.setStockQuantity(inventory.getStockQuantity() - quantity);
        workshopInventoryRepository.save(inventory);

        if (inventory.getStockQuantity() <= inventory.getAvisoThreshold()) {
            eventPublisher.publishEvent(new LowStockEvent(this, part.getId(), part.getName(), inventory.getStockQuantity(), inventory.getAvisoThreshold()));
        }

        double finalPrice = pricingStrategy.calculatePrice(inventory.getRetailPrice());

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
        recalculateAppointmentTotal(appointment);

        return saved;
    }

    /**
     * Asigna un repuesto personalizado genérico (sin stock inicial) a una cita específica, creándolo provisionalmente.
     *
     * @param appointmentId Identificador de la cita.
     * @param customName Nombre del repuesto personalizado.
     * @param quantity Cantidad asignada.
     * @return El registro de asignación generado {@link AppointmentPart}.
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
                    .appliedPrice(0.0)
                    .build();
        }

        AppointmentPart saved = appointmentPartRepository.save(appointmentPart);
        recalculateAppointmentTotal(appointment);
        return saved;
    }

    /**
     * Retira un repuesto de una cita y restaura las unidades consumidas en el inventario del almacén.
     *
     * @param appointmentId Identificador de la cita.
     * @param partId Identificador del repuesto.
     */
    @Transactional
    public void removePartFromAppointment(UUID appointmentId, UUID partId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        AppointmentPart appointmentPart = appointmentPartRepository.findByAppointmentIdAndPartId(appointmentId, partId)
                .orElseThrow(() -> new RuntimeException("La pieza no está asignada a esta cita"));

        Optional<WorkshopInventory> inventoryOpt = workshopInventoryRepository.findByPartId(partId);
        if (inventoryOpt.isPresent()) {
            WorkshopInventory inventory = inventoryOpt.get();
            inventory.setStockQuantity(inventory.getStockQuantity() + appointmentPart.getQuantityUsed());
            workshopInventoryRepository.save(inventory);
        }

        appointmentPartRepository.delete(appointmentPart);
        recalculateAppointmentTotal(appointment);
    }

    /**
     * Recalcula el coste estimado total de una cita en función de las horas del mecánico y repuestos asignados.
     *
     * @param appointment Cita a recalcular.
     */
    @Transactional
    public void recalculateAppointmentTotal(Appointment appointment) {
        double durationHours = (appointment.getEstimatedDuration() != null ? appointment.getEstimatedDuration() : 0) / 60.0;
        double hourlyRate = appointment.getWorkshop() != null && appointment.getWorkshop().getHourlyRate() != null
                ? appointment.getWorkshop().getHourlyRate() : 50.0;
        double laborCost = durationHours * hourlyRate;

        List<AppointmentPart> parts = appointmentPartRepository.findByAppointmentId(appointment.getId());
        double partsCost = parts.stream()
                .mapToDouble(p -> p.getAppliedPrice() * p.getQuantityUsed())
                .sum();
    }
}
