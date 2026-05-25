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
    private UUID id;
    private UUID appointmentId;
    private UUID workshopId;
    private Double laborRate;
    private Double totalLabor;
    private String partsJson;
    private Double totalParts;
    private Double totalPrice;
    private LocalDateTime createdAt;

    // Campos extendidos de la Cita original para consumo ágil en Frontend
    private String clientFullName;
    private String vehicleDisplay;
    private String serviceType;
    private String description;
}
