package org.tfg.backend.appointment;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AppointmentRequest {
    private UUID vehicleId;
    private UUID workshopId;
    private LocalDateTime dateTime;
    private String description;
}