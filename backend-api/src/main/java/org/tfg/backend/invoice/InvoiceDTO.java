package org.tfg.backend.invoice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Objeto de Transferencia de Datos (DTO) para representar una factura.
 * Incluye campos calculados y campos adicionales de la cita para simplificar
 * el consumo de los detalles de facturación en la interfaz gráfica del cliente.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceDTO {
    /**
     * Identificador único de la factura.
     */
    private UUID id;

    /**
     * Identificador de la cita vinculada.
     */
    private UUID appointmentId;

    /**
     * Identificador del taller emisor.
     */
    private UUID workshopId;

    /**
     * Tarifa por hora de mano de obra aplicada.
     */
    private Double laborRate;

    /**
     * Coste total de la mano de obra.
     */
    private Double totalLabor;

    /**
     * Detalle JSON con la lista de repuestos.
     */
    private String partsJson;

    /**
     * Coste total de los repuestos consumidos.
     */
    private Double totalParts;

    /**
     * Importe total general de la factura.
     */
    private Double totalPrice;

    /**
     * Fecha y hora de creación de la factura.
     */
    private LocalDateTime createdAt;

    // Campos extendidos de la Cita original para consumo ágil en Frontend
    /**
     * Nombre completo del cliente que solicitó el servicio.
     */
    private String clientFullName;

    /**
     * Detalle visual del vehículo asociado (Marca, modelo y matrícula).
     */
    private String vehicleDisplay;

    /**
     * Tipo de servicio o reparación realizado.
     */
    private String serviceType;

    /**
     * Descripción complementaria del trabajo efectuado.
     */
    private String description;
}
