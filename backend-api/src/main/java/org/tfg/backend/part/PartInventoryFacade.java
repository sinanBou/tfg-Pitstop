package org.tfg.backend.part;

import org.springframework.stereotype.Component;
import org.tfg.backend.part.service.PartAssignmentService;
import java.util.UUID;

@Component
public class PartInventoryFacade {

    private final PartAssignmentService partAssignmentService;

    public PartInventoryFacade(PartAssignmentService partAssignmentService) {
        this.partAssignmentService = partAssignmentService;
    }


    public AppointmentPart addStandardPartToAppointment(UUID appointmentId, UUID partId, int quantity) {
        return partAssignmentService.assignPartToAppointment(appointmentId, partId, quantity, new StandardPricingStrategy());
    }

    public AppointmentPart addDiscountedPartToAppointment(UUID appointmentId, UUID partId, int quantity, double discountRate) {
        return partAssignmentService.assignPartToAppointment(appointmentId, partId, quantity, new DiscountPricingStrategy(discountRate));
    }


    public void removePartAndRestoreInventory(UUID appointmentId, UUID partId) {
        partAssignmentService.removePartFromAppointment(appointmentId, partId);
    }
}
