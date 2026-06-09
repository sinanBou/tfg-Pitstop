package org.tfg.backend.appointment;

import jakarta.persistence.*;
import lombok.*;
import org.tfg.backend.employee.Employee;
import org.tfg.backend.workshop.Workshop;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad que mapea y gestiona la asignación física y temporal de los mecánicos y bahías (bays)
 * dentro del taller para evitar colisiones u overbooking.
 */
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "workload_matrix")
public class WorkloadMatrix {
    /**
     * Identificador único del registro de la matriz de carga de trabajo.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Taller asociado a la franja de trabajo.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workshop_id", nullable = false)
    private Workshop workshop;

    /**
     * Mecánico asignado al intervalo de trabajo.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mechanic_id")
    private Employee mechanic;

    /**
     * Fecha y hora exacta correspondientes a la franja horaria.
     */
    @Column(name = "slot_time", nullable = false)
    private LocalDateTime slotTime;

    /**
     * Duración en minutos ocupada por esta asignación.
     */
    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    /**
     * Número de la bahía o puesto de taller asignado para la intervención física.
     */
    @Column(name = "bay_number")
    private Integer bayNumber;

    /**
     * Cita a la cual pertenece este intervalo de carga de trabajo.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    /**
     * Número de versión del registro para control de concurrencia optimista.
     */
    @Version
    private Long version;
}

