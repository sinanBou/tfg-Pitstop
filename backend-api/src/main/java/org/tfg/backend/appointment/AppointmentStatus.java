package org.tfg.backend.appointment;

/**
* Representa los diferentes estados por los que puede pasar una cita en Pitstop.
*/
public enum AppointmentStatus {
    PENDING,    // Cita solicitada, pendiente de confirmación/asignación
    CONFIRMED,  // Cita confirmada y mecánico asignado
    IN_PROGRESS,// El mecánico está trabajando en el vehículo (reloj corriendo)
    DELAYED,    // El tiempo estimado ha sido superado
    /**
    * El trabajo en el vehÃ­culo ha finalizado y el cliente ha sido notificado.
    */
    COMPLETED,  // Trabajo finalizado, cliente avisado
    PICKED_UP,  // Vehículo recogido por el cliente
    CANCELLED   // Cita anulada
}