package org.tfg.backend.part;

import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
public class PartInventoryFacade {

    private final PartService partService;

    public PartInventoryFacade(PartService partService) {
        this.partService = partService;
    }

    /** Simplifies assigning standard priced parts */
    public AppointmentPart addStandardPartToAppointment(UUID appointmentId, UUID partId, int quantity) {
        return partService.assignPartToAppointment(appointmentId, partId, quantity, new StandardPricingStrategy());
    }

    /** Simplifies assigning discounted priced parts */
    public AppointmentPart addDiscountedPartToAppointment(UUID appointmentId, UUID partId, int quantity, double discountRate) {
        return partService.assignPartToAppointment(appointmentId, partId, quantity, new DiscountPricingStrategy(discountRate));
    }

    /** Simplifies unassigning parts and restoring inventory */
    public void removePartAndRestoreInventory(UUID appointmentId, UUID partId) {
        partService.removePartFromAppointment(appointmentId, partId);
    }
}
