package org.tfg.backend.workshop;

import lombok.Data;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Objeto que encapsula la solicitud enviada por los clientes de la API para crear o
 * actualizar los detalles y parámetros de configuración operativa de un taller.
 */
@Data
public class WorkshopRequest {
    private String cif;
    private String companyName;
    private String address;
    private UUID ownerId;

    // Nuevos campos para la persistencia del horario
    private LocalTime openTime;
    private LocalTime closeTime;
    private Integer slotDurationMinutes;
    private String workingDays;
    private Double hourlyRate;
    private Boolean includeOwnerInPlanning;
}