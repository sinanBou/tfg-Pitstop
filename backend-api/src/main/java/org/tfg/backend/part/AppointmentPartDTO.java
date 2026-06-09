package org.tfg.backend.part;

import lombok.*;
import java.util.UUID;

/**
 * Objeto de Transferencia de Datos (DTO) que representa los detalles simplificados
 * de un repuesto asignado a una cita, listo para ser expuesto en la interfaz o la API.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentPartDTO {
    private UUID id;
    private UUID partId;
    private String name;
    private Integer quantityUsed;
    private Double appliedPrice;
}
