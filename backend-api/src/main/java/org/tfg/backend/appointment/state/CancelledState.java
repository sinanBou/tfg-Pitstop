package org.tfg.backend.appointment.state;

import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentStatus;
import org.tfg.backend.vehicle.VehicleRepository;

/**
 * Estado final que representa una cita anulada o cancelada.
 */
public class CancelledState implements AppointmentState {

    /**
     * Valida las transiciones desde el estado CANCELLED.
     * Al ser un estado final, cualquier transición posterior a otro estado está prohibida.
     *
     * @param appointment Cita sobre la cual se realiza la transición.
     * @param newStatus Estado destino de la transición.
     * @param vehicleRepository Repositorio para actualizar estados del vehículo asociado.
     * @throws RuntimeException si se intenta salir de este estado final de cancelación.
     */
    @Override
    public void transitionTo(Appointment appointment, AppointmentStatus newStatus, VehicleRepository vehicleRepository) {
        if (newStatus == AppointmentStatus.CANCELLED) {
            return; // Ya se encuentra en este estado
        }
        throw new RuntimeException("La cita ha sido cancelada. No se permiten más cambios de estado.");
    }
}

