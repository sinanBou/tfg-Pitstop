package org.tfg.backend.appointment.state;

import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentStatus;
import org.tfg.backend.vehicle.VehicleRepository;

/**
 * Estado final que representa una cita anulada.
 */
public class CancelledState implements AppointmentState {

    @Override
    public void transitionTo(Appointment appointment, AppointmentStatus newStatus, VehicleRepository vehicleRepository) {
        if (newStatus == AppointmentStatus.CANCELLED) {
            return; // Ya está en este estado
        }
        throw new RuntimeException("La cita ha sido cancelada. No se permiten más cambios de estado.");
    }
}
