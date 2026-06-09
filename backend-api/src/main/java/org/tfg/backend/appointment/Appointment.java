package org.tfg.backend.appointment;

import jakarta.persistence.*;
import lombok.*;
import org.tfg.backend.client.Client;
import org.tfg.backend.vehicle.Vehicle;
import org.tfg.backend.workshop.Workshop;
import org.tfg.backend.employee.Employee;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Representa una cita en el taller de Pitstop.
 * Almacena información sobre la fecha y hora de la cita, estado, duración estimada y real,
 * comentarios del mecánico, cliente, vehículo y taller asociado, además del empleado asignado.
 */
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "appointments")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private LocalDateTime dateTime;

    @Column(nullable = false)
    private String description;

    @Column(name = "service_type")
    private String serviceType;

    @Column(name = "mechanic_comments")
    private String mechanicComments;



    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @Column(name = "estimated_duration")
    private Integer estimatedDuration; // Tiempo previsto en minutos

    @Column(name = "actual_start_time")
    private LocalDateTime actualStartTime;

    @Column(name = "actual_end_time")
    private LocalDateTime actualEndTime;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "reception_kilometers")
    private Integer receptionKilometers;

    @Column(name = "reception_notes", length = 1000)
    private String receptionNotes;

    @Column(name = "vehicle_received")
    @Builder.Default
    private Boolean vehicleReceived = false;


    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "workshop_id", nullable = false)
    private Workshop workshop;

    @ManyToOne
    @JoinColumn(name = "assigned_employee_id")
    private Employee assignedEmployee;

    @OneToMany(mappedBy = "originAppointment", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<org.tfg.backend.workshoptask.WorkshopTask> tasks;

    @OneToMany(mappedBy = "appointment", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<org.tfg.backend.part.AppointmentPart> parts;
}