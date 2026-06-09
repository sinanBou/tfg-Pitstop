package org.tfg.backend.part;

import lombok.*;
import java.util.UUID;

/**
 * DTO que representa la información de un repuesto asignado a una cita.
 * Contiene datos del repuesto y la cantidad/precio aplicado.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentPartDTO {
    /**
     * Identificador único de la asociación AppointmentPart.
     */
    private UUID id;

    /**
     * Identificador único del repuesto en el catálogo.
     */
    private UUID partId;

    /**
     * Nombre descriptivo del repuesto.
     */
    private String name;

    /**
     * Cantidad del repuesto utilizada en la cita.
     */
    private Integer quantityUsed;

    /**
     * Precio unitario final aplicado en la cita.
     */
    private Double appliedPrice;
}
