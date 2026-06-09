package org.tfg.backend.appointment.state;

import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentStatus;
import org.tfg.backend.vehicle.Vehicle;
import org.tfg.backend.vehicle.VehicleRepository;
import java.time.LocalDateTime;

/**
 * Estado que representa una cita confirmada por el taller y con mecánico asignado.
 */
public class ConfirmedState implements AppointmentState {

    /**
     * Realiza las transiciones desde el estado CONFIRMED.
     * Registra el inicio real de la reparación si cambia a IN_PROGRESS, o la finalización si cambia a COMPLETED.
     * Si pasa a CANCELLED, libera la vinculación del vehículo al taller.
     *
     * @param appointment Cita sobre la cual se realiza la transición.
     * @param newStatus Estado destino de la transición.
     * @param vehicleRepository Repositorio para actualizar estados del vehículo asociado.
     */
    @Override
    public void transitionTo(Appointment appointment, AppointmentStatus newStatus, VehicleRepository vehicleRepository) {
        if (newStatus == AppointmentStatus.CONFIRMED) {
            return; // Ya se encuentra en este estado
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

