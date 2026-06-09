package org.tfg.backend.appointment;

/**
 * Representa los diferentes estados por los que puede pasar una cita en Pitstop.
 */
public enum AppointmentStatus {
    /**
     * Cita solicitada por el cliente, pendiente de confirmación o asignación de mecánico.
     */
    PENDING,

    /**
     * Cita confirmada y con mecánico asignado.
     */
    CONFIRMED,

    /**
     * El mecánico está trabajando activamente en el vehículo (reloj de tiempo activo).
     */
    IN_PROGRESS,

    /**
     * Se ha superado el tiempo estimado asignado originalmente a la cita.
     */
    DELAYED,

    /**
     * El trabajo en el vehículo ha finalizado y el cliente ha sido notificado.
     */
    COMPLETED,

    /**
     * El vehículo ha sido recogido físicamente por el cliente del taller.
     */
    PICKED_UP,

    /**
     * La cita ha sido anulada o cancelada.
     */
    CANCELLED
}

