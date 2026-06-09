package org.tfg.backend.appointment.state;

import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentStatus;
import org.tfg.backend.vehicle.VehicleRepository;
import java.time.LocalDateTime;

/**
 * Estado que representa que el tiempo estimado de trabajo ha sido superado (retraso).
 */
public class DelayedState implements AppointmentState {

    /**
     * Realiza las transiciones desde el estado DELAYED.
     * Registra el fin real del trabajo si pasa a COMPLETED y prohíbe cancelaciones directas.
     *
     * @param appointment Cita sobre la cual se realiza la transición.
     * @param newStatus Estado destino de la transición.
     * @param vehicleRepository Repositorio para actualizar estados del vehículo asociado.
     * @throws RuntimeException si se intenta cancelar una cita en estado de retraso.
     */
    @Override
    public void transitionTo(Appointment appointment, AppointmentStatus newStatus, VehicleRepository vehicleRepository) {
        if (newStatus == AppointmentStatus.DELAYED) {
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

