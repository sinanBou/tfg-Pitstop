package org.tfg.backend.appointment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentDTO {
    private UUID id;
    private LocalDateTime dateTime;
    private String description;
    private String serviceType;
    private String mechanicComments;
    private java.util.List<org.tfg.backend.part.AppointmentPartDTO> parts;
    private AppointmentStatus status;

    // Control de tiempos
    private Integer estimatedDuration;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private LocalDateTime confirmedAt;
    private Integer receptionKilometers;
    private String receptionNotes;
    private Boolean vehicleReceived;


    // Información del Cliente
    private String clientFullName;

    // Información del Vehículo
    private UUID vehicleId;
    private String vehicleDisplay; // Ejemplo: "BMW Serie 3 (1234ABC)"

    // Información del Taller
    private UUID workshopId;
    private String workshopName;
    private Double workshopHourlyRate;

    // Información del Empleado Asignado
    private UUID assignedEmployeeId;
    private String assignedEmployeeName;

    // Coste total real/estimado
    private Double totalPrice;
}