package org.tfg.backend.appointment;

public enum AppointmentStatus {
    PENDING,    // Cita solicitada, pendiente de confirmación/asignación
    CONFIRMED,  // Cita confirmada y mecánico asignado
    IN_PROGRESS,// El mecánico está trabajando en el vehículo (reloj corriendo)
    DELAYED,    // El tiempo estimado ha sido superado
    COMPLETED,  // Trabajo finalizado
    CANCELLED   // Cita anulada
}
