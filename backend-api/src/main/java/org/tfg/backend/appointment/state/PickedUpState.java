package org.tfg.backend.appointment.state;

import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentStatus;
import org.tfg.backend.vehicle.VehicleRepository;

/**
 * Estado final que representa que el vehículo ha sido entregado físicamente y recogido por el cliente.
 */
public class PickedUpState implements AppointmentState {

    /**
     * Valida las transiciones desde el estado PICKED_UP.
     * Como es un estado final, cualquier transición posterior a otro estado está prohibida.
     *
     * @param appointment Cita sobre la cual se realiza la transición.
     * @param newStatus Estado destino de la transición.
     * @param vehicleRepository Repositorio para actualizar estados del vehículo asociado.
     * @throws RuntimeException si se intenta salir de este estado final.
     */
    @Override
    public void transitionTo(Appointment appointment, AppointmentStatus newStatus, VehicleRepository vehicleRepository) {
        if (newStatus == AppointmentStatus.PICKED_UP) {
            return; // Ya se encuentra en este estado
        }
        throw new RuntimeException("La cita ya ha sido recogida y finalizada. No se permiten más cambios de estado.");
    }
}

