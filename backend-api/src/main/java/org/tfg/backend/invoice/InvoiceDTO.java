package org.tfg.backend.invoice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceDTO {
    /**
    * Identificador Ãºnico de la factura.
    */
    private UUID id;
    private UUID appointmentId;
    private UUID workshopId;
    private Double laborRate;
    private Double totalLabor;
    /**
    * Detalle JSON con la lista de repuestos.
    */
    private String partsJson;
    private Double totalParts;
    private Double totalPrice;
    private LocalDateTime createdAt;

    // Campos extendidos de la Cita original para consumo ágil en Frontend
    /**
    * Nombre completo del cliente que solicitÃ³ el servicio.
    */
    private String clientFullName;
    private String vehicleDisplay;
    private String serviceType;
    private String description;
}