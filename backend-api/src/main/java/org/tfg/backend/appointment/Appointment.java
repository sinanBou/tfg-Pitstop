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
 * Entidad de persistencia que representa una cita o reservación para el mantenimiento
 * o reparación de un vehículo en un taller específico.
 */
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "appointments")
public class Appointment {
    /**
     * Identificador único de la cita.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Fecha y hora programadas para la cita.
     */
    @Column(nullable = false)
    private LocalDateTime dateTime;

    /**
     * Descripción detallada del problema o servicio solicitado por el cliente.
     */
    @Column(nullable = false)
    private String description;

    /**
     * Tipo de servicio principal (por ejemplo: revisión general, cambio de aceite, chapa y pintura).
     */
    @Column(name = "service_type")
    private String serviceType;

    /**
     * Comentarios y notas técnicas añadidos por el mecánico responsable de la reparación.
     */
    @Column(name = "mechanic_comments")
    private String mechanicComments;

    /**
     * Estado actual en el que se encuentra la cita. Por defecto es PENDING.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status = AppointmentStatus.PENDING;

    /**
     * Duración aproximada de la cita expresada en minutos.
     */
    @Column(name = "estimated_duration")
    private Integer estimatedDuration;

    /**
     * Fecha y hora real de inicio de los trabajos en el taller.
     */
    @Column(name = "actual_start_time")
    private LocalDateTime actualStartTime;

    /**
     * Fecha y hora real de finalización de los trabajos técnicos.
     */
    @Column(name = "actual_end_time")
    private LocalDateTime actualEndTime;

    /**
     * Fecha y hora exactas en que se confirmó la cita por parte del taller.
     */
    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    /**
     * Kilometraje que marca el vehículo al ser recibido en el taller.
     */
    @Column(name = "reception_kilometers")
    private Integer receptionKilometers;

    /**
     * Observaciones, daños visuales u otras anotaciones realizadas al recibir el vehículo.
     */
    @Column(name = "reception_notes", length = 1000)
    private String receptionNotes;

    /**
     * Flag que indica si el vehículo ha sido entregado físicamente en el taller.
     */
    @Column(name = "vehicle_received")
    @Builder.Default
    private Boolean vehicleReceived = false;

    /**
     * Cliente propietario del vehículo y solicitante de la cita.
     */
    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    /**
     * Vehículo asociado a la intervención mecánica de la cita.
     */
    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    /**
     * Taller en el cual se realiza la intervención y donde se agendó la cita.
     */
    @ManyToOne
    @JoinColumn(name = "workshop_id", nullable = false)
    private Workshop workshop;

    /**
     * Empleado (generalmente mecánico o técnico) asignado al diagnóstico o reparación.
     */
    @ManyToOne
    @JoinColumn(name = "assigned_employee_id")
    private Employee assignedEmployee;

    /**
     * Listado de tareas de taller asociadas y planificadas en el ámbito de esta cita.
     */
    @OneToMany(mappedBy = "originAppointment", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<org.tfg.backend.workshoptask.WorkshopTask> tasks;

    /**
     * Listado de repuestos y piezas utilizadas en el coche durante la cita.
     */
    @OneToMany(mappedBy = "appointment", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<org.tfg.backend.part.AppointmentPart> parts;
}