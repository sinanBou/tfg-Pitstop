package org.tfg.backend.appointment;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Objeto de solicitud utilizado para la creación o reserva de una nueva cita.
 */
@Data
public class AppointmentRequest {
    /**
     * Identificador único del vehículo asociado a la cita.
     */
    private UUID vehicleId;

    /**
     * Identificador único del taller donde se realizará el servicio.
     */
    private UUID workshopId;

    /**
     * Identificador único del empleado (mecánico) asignado a la cita.
     */
    private UUID assignedEmployeeId;

    /**
     * Fecha y hora programadas para la cita.
     */
    private LocalDateTime dateTime;

    /**
     * Descripción del problema o motivo de la visita provisto por el cliente.
     */
    private String description;

    /**
     * Tipo de servicio a realizar (por ejemplo: mantenimiento, reparación, etc.).
     */
    private String serviceType;

    /**
     * Duración estimada del servicio expresada en minutos.
     */
    private Integer estimatedDuration;
}