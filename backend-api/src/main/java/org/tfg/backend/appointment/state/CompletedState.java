package org.tfg.backend.appointment.state;

import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentStatus;
import org.tfg.backend.vehicle.Vehicle;
import org.tfg.backend.vehicle.VehicleRepository;

/**
 * Estado que representa que el trabajo de reparación/mantenimiento ha sido finalizado.
 */
public class CompletedState implements AppointmentState {

    @Override
    public void transitionTo(Appointment appointment, AppointmentStatus newStatus, VehicleRepository vehicleRepository) {
        if (newStatus == AppointmentStatus.COMPLETED) {
            return;
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
