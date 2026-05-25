package org.tfg.backend.part;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.tfg.backend.appointment.Appointment;
import java.util.UUID;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "appointment_parts")
public class AppointmentPart {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "appointment_id", nullable = false)
    @JsonIgnore
    private Appointment appointment;

    @ManyToOne
    @JoinColumn(name = "part_id", nullable = false)
    private PartCatalog part;

    @Column(name = "quantity_used", nullable = false)
    private Integer quantityUsed = 0;

    @Column(name = "applied_price", nullable = false)
    private Double appliedPrice = 0.0;
}
