package org.tfg.backend.part;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.tfg.backend.appointment.Appointment;
import java.util.UUID;

/**
 * Entidad que representa la asociación de un repuesto del catálogo con una cita específica.
 * Registra la cantidad utilizada del repuesto y el precio unitario aplicado en dicha cita.
 */
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "appointment_parts")
public class AppointmentPart {
    /**
     * Identificador único del registro.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Cita a la cual se asocia el repuesto.
     */
    @ManyToOne
    @JoinColumn(name = "appointment_id", nullable = false)
    @JsonIgnore
    private Appointment appointment;

    /**
     * Repuesto del catálogo asignado.
     */
    @ManyToOne
    @JoinColumn(name = "part_id", nullable = false)
    private PartCatalog part;

    /**
     * Cantidad utilizada del repuesto en la cita.
     */
    @Builder.Default
    @Column(name = "quantity_used", nullable = false)
    private Integer quantityUsed = 0;

    /**
     * Precio unitario aplicado al repuesto en el momento de la cita.
     */
    @Builder.Default
    @Column(name = "applied_price", nullable = false)
    private Double appliedPrice = 0.0;
}
