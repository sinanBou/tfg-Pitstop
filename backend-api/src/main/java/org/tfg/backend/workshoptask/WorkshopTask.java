package org.tfg.backend.workshoptask;

import jakarta.persistence.*;
import lombok.*;
import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.employee.Employee;
import org.tfg.backend.vehicle.Vehicle;
import org.tfg.backend.workshop.Workshop;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "workshop_tasks")
public class WorkshopTask {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private LocalDateTime dateTime;

    @Column(nullable = false)
    private String description;

    @Column(name = "service_type")
    private String serviceType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private WorkshopTaskStatus status = WorkshopTaskStatus.PENDING;

    @Column(name = "estimated_duration")
    private Integer estimatedDuration;

    @Column(name = "actual_start_time")
    private LocalDateTime actualStartTime;

    @Column(name = "actual_end_time")
    private LocalDateTime actualEndTime;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "workshop_id", nullable = false)
    private Workshop workshop;

    @ManyToOne
    @JoinColumn(name = "assigned_employee_id")
    private Employee assignedEmployee;

    @ManyToOne
    @JoinColumn(name = "appointment_id")
    private Appointment originAppointment;

    @Column(name = "completed_tasks")
    private String completedTasks;
}
