package org.tfg.backend.invoice;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad de persistencia que representa una factura de taller.
 * Almacena los costes de mano de obra, los repuestos utilizados en formato JSON,
 * el precio total y la fecha de creación asociados a una cita específica.
 */
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "invoices")
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Identificador de la cita asociada a la factura.
     */
    @Column(name = "appointment_id", nullable = false)
    private UUID appointmentId;

    /**
     * Identificador del taller emisor de la factura.
     */
    @Column(name = "workshop_id", nullable = false)
    private UUID workshopId;

    /**
     * Tarifa por hora cobrada en concepto de mano de obra.
     */
    @Column(name = "labor_rate", nullable = false)
    private Double laborRate;

    /**
     * Coste total final facturado por mano de obra.
     */
    @Column(name = "total_labor", nullable = false)
    private Double totalLabor;

    /**
     * Cadena en formato JSON que detalla los repuestos utilizados y su desglose de precios.
     */
    @Lob
    @Column(name = "parts_json", columnDefinition = "LONGTEXT")
    private String partsJson;

    /**
     * Coste total acumulado por la compra e instalación de repuestos.
     */
    @Column(name = "total_parts", nullable = false)
    private Double totalParts;

    /**
     * Importe final y total de la factura (Mano de obra + Repuestos).
     */
    @Column(name = "total_price", nullable = false)
    private Double totalPrice;

    /**
     * Fecha y hora en la que se emitió y registró la factura.
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
