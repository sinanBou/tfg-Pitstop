package org.tfg.backend.appointment.state;

import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentStatus;
import org.tfg.backend.vehicle.Vehicle;
import org.tfg.backend.vehicle.VehicleRepository;
import java.time.LocalDateTime;

/**
 * Estado que representa una cita solicitada pero pendiente de confirmación por el taller.
 */
public class PendingState implements AppointmentState {

    /**
     * Realiza las transiciones desde el estado PENDING a estados posteriores.
     * Gestiona el registro temporal de confirmación o inicio y libera/cancela
     * el estado del vehículo en caso de cancelación de cita.
     *
     * @param appointment Cita sobre la cual se realiza la transición.
     * @param newStatus Estado destino de la transición.
     * @param vehicleRepository Repositorio para actualizar estados del vehículo asociado.
     */
    @Override
    public void transitionTo(Appointment appointment, AppointmentStatus newStatus, VehicleRepository vehicleRepository) {
        if (newStatus == AppointmentStatus.PENDING) {
            return; // Ya se encuentra en este estado
        }

        // Lógica de fechado automático según transiciones
        if (newStatus == AppointmentStatus.CONFIRMED || newStatus == AppointmentStatus.IN_PROGRESS || newStatus == AppointmentStatus.COMPLETED) {
            if (appointment.getConfirmedAt() == null) {
                appointment.setConfirmedAt(LocalDateTime.now());
            }
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

        // Si se cancela la cita, restablece el estado del vehículo a CANCELADO
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

