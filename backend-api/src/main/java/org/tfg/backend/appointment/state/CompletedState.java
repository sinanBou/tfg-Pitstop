package org.tfg.backend.appointment.state;

import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentStatus;
import org.tfg.backend.vehicle.Vehicle;
import org.tfg.backend.vehicle.VehicleRepository;

/**
 * Estado que representa que el trabajo de reparación/mantenimiento ha sido finalizado correctamente en el vehículo.
 */
public class CompletedState implements AppointmentState {

    /**
     * Realiza las transiciones desde el estado COMPLETED.
     * Si pasa a PICKED_UP, libera la vinculación del vehículo con el taller (se lo lleva el cliente).
     * Prohíbe cancelaciones directas.
     *
     * @param appointment Cita sobre la cual se realiza la transición.
     * @param newStatus Estado destino de la transición.
     * @param vehicleRepository Repositorio para actualizar estados del vehículo asociado.
     * @throws RuntimeException si se intenta cancelar una cita que ya fue completada.
     */
    @Override
    public void transitionTo(Appointment appointment, AppointmentStatus newStatus, VehicleRepository vehicleRepository) {
        if (newStatus == AppointmentStatus.COMPLETED) {
            return; // Ya se encuentra en este estado
        }

        if (newStatus == AppointmentStatus.CANCELLED) {
            throw new RuntimeException("No se puede cancelar una cita en este estado.");
        }

        if (newStatus == AppointmentStatus.PICKED_UP) {
            Vehicle vehicle = appointment.getVehicle();
            if (vehicle != null) {
                vehicle.setCurrentWorkshop(null);
                vehicle.setStatus("ENTREGADO");
                vehicleRepository.save(vehicle);
            }
        }

        appointment.setStatus(newStatus);
    }
}

