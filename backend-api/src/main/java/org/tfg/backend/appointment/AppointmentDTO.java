package org.tfg.backend.appointment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Objeto de transferencia de datos (DTO) para representar la información detallada de una cita.
 * Incluye campos consolidados para mostrar datos del cliente, vehículo, taller, y costes totales.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentDTO {
    /**
    * Identificador Ãºnico de la cita.
    */
    private UUID id;
    private LocalDateTime dateTime;
    private String description;
    private String serviceType;
    private String mechanicComments;
    /**
    * Repuestos consumidos y su desglose asociados a la cita.
    */
    private java.util.List<org.tfg.backend.part.AppointmentPartDTO> parts;
    private AppointmentStatus status;

    // Control de tiempos
    private Integer estimatedDuration;
    /**
    * Momento real en el que se iniciÃ³ el trabajo en el taller.
    */
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private LocalDateTime confirmedAt;
    private Integer receptionKilometers;
    private String receptionNotes;
    /**
    * Indica si el vehÃ­culo ha sido fÃ­sicamente depositado en las instalaciones.
    */
    private Boolean vehicleReceived;


    // Información del Cliente
    private String clientFullName;

    // Información del Vehículo
    /**
    * Identificador Ãºnico del vehÃ­culo.
    */
    private UUID vehicleId;
    private String vehicleDisplay; // Ejemplo: "BMW Serie 3 (1234ABC)"

    // Información del Taller
    private UUID workshopId;
    /**
    * Nombre comercial del taller.
    */
    private String workshopName;
    private Double workshopHourlyRate;

    // Información del Empleado Asignado
    private UUID assignedEmployeeId;
    /**
    * Nombre completo del empleado a cargo de los trabajos.
    */
    private String assignedEmployeeName;

    // Coste total real/estimado
    private Double totalPrice;
}