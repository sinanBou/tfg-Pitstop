package org.tfg.backend.invoice;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

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

    @Column(name = "appointment_id", nullable = false)
    private UUID appointmentId;

    @Column(name = "workshop_id", nullable = false)
    private UUID workshopId;

    @Column(name = "labor_rate", nullable = false)
    private Double laborRate;

    @Column(name = "total_labor", nullable = false)
    private Double totalLabor;

    @Lob
    @Column(name = "parts_json", columnDefinition = "LONGTEXT")
    private String partsJson;

    @Column(name = "total_parts", nullable = false)
    private Double totalParts;

    @Column(name = "total_price", nullable = false)
    private Double totalPrice;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
