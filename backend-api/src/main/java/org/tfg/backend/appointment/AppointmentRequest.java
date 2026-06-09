package org.tfg.backend.appointment;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Representa la solicitud de creación o modificación de una cita en el sistema.
 * Contiene los identificadores necesarios del vehículo, taller, empleado asignado, fecha, duración y descripción.
 */
@Data
public class AppointmentRequest {
    /**
    * Identificador Ãºnico del vehÃ­culo asociado a la cita.
    */
    private UUID vehicleId;
    private UUID workshopId;
    private UUID assignedEmployeeId;
    private LocalDateTime dateTime;
    private String description;
    /**
    * Tipo de servicio a realizar (por ejemplo: mantenimiento, reparaciÃ³n, etc.).
    */
    private String serviceType;
    private Integer estimatedDuration;
}