package org.tfg.backend.appointment.state;

import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentStatus;
import org.tfg.backend.vehicle.VehicleRepository;
import java.time.LocalDateTime;

/**
 * Estado que representa que el mecánico está trabajando activamente en el vehículo dentro del taller.
 */
public class InProgressState implements AppointmentState {

    /**
     * Realiza las transiciones desde el estado IN_PROGRESS.
     * Registra la fecha y hora de finalización real cuando pasa a COMPLETED.
     * Bloquea e impide cancelaciones directas en este estado.
     *
     * @param appointment Cita sobre la cual se realiza la transición.
     * @param newStatus Estado destino de la transición.
     * @param vehicleRepository Repositorio para actualizar estados del vehículo asociado.
     * @throws RuntimeException si se intenta cancelar una cita que ya está en curso.
     */
    @Override
    public void transitionTo(Appointment appointment, AppointmentStatus newStatus, VehicleRepository vehicleRepository) {
        if (newStatus == AppointmentStatus.IN_PROGRESS) {
            return; // Ya se encuentra en este estado
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

