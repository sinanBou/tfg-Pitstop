package org.tfg.backend.appointment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Objeto de transferencia de datos (DTO) que simplifica y expone la información detallada de una cita.
 * Contiene datos del cliente, vehículo, taller, empleado asignado, repuestos y el coste total acumulado.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentDTO {
    /**
     * Identificador único de la cita.
     */
    private UUID id;

    /**
     * Fecha y hora agendadas para la cita.
     */
    private LocalDateTime dateTime;

    /**
     * Motivo o descripción inicial de la cita.
     */
    private String description;

    /**
     * Tipo de intervención técnica o servicio.
     */
    private String serviceType;

    /**
     * Comentarios técnicos introducidos por el mecánico a cargo.
     */
    private String mechanicComments;

    /**
     * Repuestos consumidos y su desglose asociados a la cita.
     */
    private java.util.List<org.tfg.backend.part.AppointmentPartDTO> parts;

    /**
     * Estado operativo actual de la cita.
     */
    private AppointmentStatus status;

    /**
     * Duración estimada del trabajo en minutos.
     */
    private Integer estimatedDuration;

    /**
     * Momento real en el que se inició el trabajo en el taller.
     */
    private LocalDateTime actualStartTime;

    /**
     * Momento real en el que finalizó el trabajo en el taller.
     */
    private LocalDateTime actualEndTime;

    /**
     * Momento de confirmación de la cita.
     */
    private LocalDateTime confirmedAt;

    /**
     * Kilómetros declarados en la recepción del vehículo.
     */
    private Integer receptionKilometers;

    /**
     * Notas u observaciones recogidas en la fase de recepción.
     */
    private String receptionNotes;

    /**
     * Indica si el vehículo ha sido físicamente depositado en las instalaciones.
     */
    private Boolean vehicleReceived;

    /**
     * Nombre completo del cliente propietario.
     */
    private String clientFullName;

    /**
     * Identificador único del vehículo.
     */
    private UUID vehicleId;

    /**
     * Representación textual legible del vehículo (Marca, Modelo, Matrícula).
     */
    private String vehicleDisplay;

    /**
     * Identificador único del taller.
     */
    private UUID workshopId;

    /**
     * Nombre comercial del taller.
     */
    private String workshopName;

    /**
     * Tarifa por hora de mano de obra establecida en el taller.
     */
    private Double workshopHourlyRate;

    /**
     * Identificador único del empleado asignado.
     */
    private UUID assignedEmployeeId;

    /**
     * Nombre completo del empleado a cargo de los trabajos.
     */
    private String assignedEmployeeName;

    /**
     * Coste económico total acumulado de la cita (suma de mano de obra y repuestos).
     */
    private Double totalPrice;
}