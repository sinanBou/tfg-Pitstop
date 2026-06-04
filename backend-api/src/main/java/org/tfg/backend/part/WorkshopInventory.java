package org.tfg.backend.part;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = "workshop")
@Table(name = "workshop_inventory", uniqueConstraints = {@UniqueConstraint(columnNames = {"workshop_id", "part_id"})})
public class WorkshopInventory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "part_id", nullable = false)
    private PartCatalog part;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workshop_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private org.tfg.backend.workshop.Workshop workshop;


    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "cost_price", nullable = false)
    private Double costPrice = 0.0;

    @Column(name = "retail_price", nullable = false)
    private Double retailPrice = 0.0;

    @Column(name = "aviso_threshold")
    private Integer avisoThreshold = 0;
}
