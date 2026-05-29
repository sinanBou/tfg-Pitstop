package org.tfg.backend.appointment.state;

import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentStatus;
import org.tfg.backend.vehicle.VehicleRepository;
import java.time.LocalDateTime;

/**
 * Estado que representa que el tiempo estimado de trabajo ha sido superado.
 */
public class DelayedState implements AppointmentState {

    @Override
    public void transitionTo(Appointment appointment, AppointmentStatus newStatus, VehicleRepository vehicleRepository) {
        if (newStatus == AppointmentStatus.DELAYED) {
            return;
        }

        if (newStatus == AppointmentStatus.CANCELLED) {
            throw new RuntimeException("No se puede cancelar una cita en este estado.");
        }

        if (newStatus == AppointmentStatus.COMPLETED) {
            if (appointment.getActualEndTime() == null) {
                appointment.setActualEndTime(LocalDateTime.now());
            }
        }

        appointment.setStatus(newStatus);
    }
}
