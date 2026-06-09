package org.tfg.backend.part;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

/**
 * Entidad que representa la disponibilidad física, stock y precios de un repuesto del catálogo
 * en el inventario/almacén del taller. También define el umbral para las alertas de falta de stock.
 */
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "workshop_inventory")
public class WorkshopInventory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "part_id", nullable = false)
    private PartCatalog part;


    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "cost_price", nullable = false)
    private Double costPrice = 0.0;

    @Column(name = "retail_price", nullable = false)
    private Double retailPrice = 0.0;

    @Column(name = "aviso_threshold")
    private Integer avisoThreshold = 0;
}
