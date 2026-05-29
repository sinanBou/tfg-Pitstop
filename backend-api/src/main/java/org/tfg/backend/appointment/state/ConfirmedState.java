package org.tfg.backend.appointment.state;

import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentStatus;
import org.tfg.backend.vehicle.Vehicle;
import org.tfg.backend.vehicle.VehicleRepository;
import java.time.LocalDateTime;

/**
 * Estado que representa una cita confirmada y con mecánico asignado.
 */
public class ConfirmedState implements AppointmentState {

    @Override
    public void transitionTo(Appointment appointment, AppointmentStatus newStatus, VehicleRepository vehicleRepository) {
        if (newStatus == AppointmentStatus.CONFIRMED) {
            return;
        }

        if (newStatus == AppointmentStatus.IN_PROGRESS) {
            if (appointment.getActualStartTime() == null) {
                appointment.setActualStartTime(LocalDateTime.now());
            }
        } else if (newStatus == AppointmentStatus.COMPLETED) {
            if (appointment.getActualEndTime() == null) {
                appointment.setActualEndTime(LocalDateTime.now());
            }
        }

        if (newStatus == AppointmentStatus.CANCELLED) {
            Vehicle vehicle = appointment.getVehicle();
            if (vehicle != null) {
                vehicle.setCurrentWorkshop(null);
                vehicle.setStatus("CANCELADO");
                vehicleRepository.save(vehicle);
            }
        }

        appointment.setStatus(newStatus);
    }
}
