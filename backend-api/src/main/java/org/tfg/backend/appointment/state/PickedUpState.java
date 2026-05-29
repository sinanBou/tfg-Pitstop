package org.tfg.backend.appointment.state;

import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentStatus;
import org.tfg.backend.vehicle.VehicleRepository;

/**
 * Estado final que representa que el vehículo ha sido entregado/recogido por el cliente.
 */
public class PickedUpState implements AppointmentState {

    @Override
    public void transitionTo(Appointment appointment, AppointmentStatus newStatus, VehicleRepository vehicleRepository) {
        if (newStatus == AppointmentStatus.PICKED_UP) {
            return; // Ya está en este estado
        }
        throw new RuntimeException("La cita ya ha sido recogida y finalizada. No se permiten más cambios de estado.");
    }
}
