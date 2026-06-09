package org.tfg.backend.part;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

/**
 * Entidad que representa la relación del inventario de repuestos asociados a un taller específico.
 * Registra el stock disponible, precios de coste y venta al público, y el umbral de aviso de stock bajo.
 */
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = "workshop")
@Table(name = "workshop_inventory", uniqueConstraints = {@UniqueConstraint(columnNames = {"workshop_id", "part_id"})})
public class WorkshopInventory {
    /**
     * Identificador único de la pieza en el inventario del taller.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Repuesto del catálogo asociado.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "part_id", nullable = false)
    private PartCatalog part;

    /**
     * Taller propietario de este inventario.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workshop_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private org.tfg.backend.workshop.Workshop workshop;

    /**
     * Cantidad actual de stock disponible en el taller.
     */
    @Builder.Default
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    /**
     * Precio de coste del repuesto.
     */
    @Builder.Default
    @Column(name = "cost_price", nullable = false)
    private Double costPrice = 0.0;

    /**
     * Precio base de venta al público sugerido.
     */
    @Builder.Default
    @Column(name = "retail_price", nullable = false)
    private Double retailPrice = 0.0;

    /**
     * Umbral de cantidad de stock por debajo del cual se emite una alerta de bajo stock.
     */
    @Builder.Default
    @Column(name = "aviso_threshold")
    private Integer avisoThreshold = 0;
}
