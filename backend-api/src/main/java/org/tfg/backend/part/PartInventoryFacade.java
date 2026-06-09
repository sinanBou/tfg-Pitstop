package org.tfg.backend.part;

import org.springframework.stereotype.Component;
import java.util.UUID;

/**
 * Fachada (Facade) que simplifica las operaciones de gestión del inventario de repuestos,
 * proporcionando métodos directos para asignar y desasignar repuestos a las citas
 * utilizando diferentes estrategias de precios.
 */
@Component
public class PartInventoryFacade {

    private final PartService partService;

    /**
     * Construye la fachada con el servicio de repuestos inyectado.
     *
     * @param partService El servicio de repuestos.
     */
    public PartInventoryFacade(PartService partService) {
        this.partService = partService;
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
        return partService.assignPartToAppointment(appointmentId, partId, quantity, new StandardPricingStrategy());
    }

    /**
     * Asigna un repuesto a una cita aplicando un descuento porcentual sobre el precio base.
     *
     * @param appointmentId Identificador único de la cita.
     * @param partId Identificador único del repuesto.
     * @param quantity Cantidad de repuestos a asignar.
     * @param discountRate Tasa de descuento aplicable (por ejemplo, 0.1 para 10%).
     * @return La entidad de asociación de repuesto en la cita con descuento aplicado.
     */
    public AppointmentPart addDiscountedPartToAppointment(UUID appointmentId, UUID partId, int quantity, double discountRate) {
        return partService.assignPartToAppointment(appointmentId, partId, quantity, new DiscountPricingStrategy(discountRate));
    }

    /**
     * Retira un repuesto previamente asignado a una cita y restaura la cantidad correspondiente al inventario.
     *
     * @param appointmentId Identificador único de la cita.
     * @param partId Identificador único del repuesto.
     */
    public void removePartAndRestoreInventory(UUID appointmentId, UUID partId) {
        partService.removePartFromAppointment(appointmentId, partId);
    }
}

