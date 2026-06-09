package org.tfg.backend.appointment.state;

import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentStatus;
import org.tfg.backend.vehicle.VehicleRepository;

/**
 * Interfaz que define el comportamiento y las transiciones permitidas para los diferentes
 * estados del ciclo de vida de una cita (Appointment) siguiendo el patrón de diseño State.
 */
public interface AppointmentState {
    /**
     * Realiza la transición al nuevo estado solicitado, validando reglas de negocio
     * y realizando acciones secundarias (fichado temporal, liberación del vehículo, etc.).
     *
     * @param appointment Cita sobre la cual se realiza la transición.
     * @param newStatus Estado destino de la transición.
     * @param vehicleRepository Repositorio para actualizar estados del vehículo asociado.
     */
    void transitionTo(Appointment appointment, AppointmentStatus newStatus, VehicleRepository vehicleRepository);
}

