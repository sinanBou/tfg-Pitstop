package org.tfg.backend.appointment;

import jakarta.persistence.*;
import lombok.*;
import org.tfg.backend.employee.Employee;
import org.tfg.backend.workshop.Workshop;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "workload_matrix")
public class WorkloadMatrix {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workshop_id", nullable = false)
    private Workshop workshop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mechanic_id")
    private Employee mechanic;

    @Column(name = "slot_time", nullable = false)
    private LocalDateTime slotTime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "bay_number")
    private Integer bayNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Version
    private Long version;
}
