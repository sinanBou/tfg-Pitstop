package org.tfg.backend.appointment.state;

import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentStatus;
import org.tfg.backend.vehicle.VehicleRepository;

/**
 * Interfaz que define el comportamiento de los diferentes estados
 * del ciclo de vida de una Cita (Appointment) siguiendo el patrón State.
 */
public interface AppointmentState {
    void transitionTo(Appointment appointment, AppointmentStatus newStatus, VehicleRepository vehicleRepository);
}
