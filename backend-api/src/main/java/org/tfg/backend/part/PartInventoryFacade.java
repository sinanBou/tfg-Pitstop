package org.tfg.backend.part;

import org.springframework.stereotype.Component;
import org.tfg.backend.part.service.PartAssignmentService;
import java.util.UUID;

/**
 * Fachada para simplificar las operaciones complejas de inventario y asignación de repuestos
 * a citas. Actúa como punto de entrada de alto nivel encapsulando lógica de negocio.
 */
@Component
public class PartInventoryFacade {

    private final PartAssignmentService partAssignmentService;

    /**
     * Constructor para la inyección de dependencias de la fachada.
     *
     * @param partAssignmentService Servicio de asignación de repuestos.
     */
    public PartInventoryFacade(PartAssignmentService partAssignmentService) {
        this.partAssignmentService = partAssignmentService;
    }

    /**
     * Asigna un repuesto a una cita utilizando la estrategia de precio estándar.
     *
     * @param appointmentId Identificador único de la cita.
     * @param partId Identificador único del repuesto.
     * @param quantity Cantidad de repuestos a asignar.
     * @return La entidad de asociación de repuesto en la cita.
     */
    public AppointmentPart addStandardPartToAppointment(UUID appointmentId, UUID partId, int quantity) {
        return partAssignmentService.assignPartToAppointment(appointmentId, partId, quantity, new StandardPricingStrategy());
    }

    /**
     * Asigna un repuesto a una cita aplicando un descuento porcentual sobre el precio de venta.
     *
     * @param appointmentId Identificador único de la cita.
     * @param partId Identificador único del repuesto.
     * @param quantity Cantidad de repuestos a asignar.
     * @param discountRate Tasa de descuento aplicada (ej. 0.15 para el 15%).
     * @return La entidad de asociación de repuesto en la cita.
     */
    public AppointmentPart addDiscountedPartToAppointment(UUID appointmentId, UUID partId, int quantity, double discountRate) {
        return partAssignmentService.assignPartToAppointment(appointmentId, partId, quantity, new DiscountPricingStrategy(discountRate));
    }

    /**
     * Retira un repuesto previamente asignado a una cita y restaura la cantidad correspondiente al inventario.
     *
     * @param appointmentId Identificador único de la cita.
     * @param partId Identificador único del repuesto.
     */
    public void removePartAndRestoreInventory(UUID appointmentId, UUID partId) {
        partAssignmentService.removePartFromAppointment(appointmentId, partId);
    }
}