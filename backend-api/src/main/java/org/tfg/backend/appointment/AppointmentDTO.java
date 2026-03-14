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

    // Información del Cliente
    private String clientFullName;

    // Información del Vehículo
    private UUID vehicleId;
    private String vehicleDisplay; // Ejemplo: "BMW Serie 3 (1234ABC)"

    // Información del Taller
    private UUID workshopId;
    private String workshopName;
}