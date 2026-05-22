package org.tfg.backend.workshop;

import lombok.Data;
import java.time.LocalTime;
import java.util.UUID;

@Data
public class WorkshopRequest {
    private String cif;
    private String companyName;
    private String address;
    private UUID ownerId;

    // Nuevos campos para la persistencia del horario
    private LocalTime openTime;
    private LocalTime closeTime;
    private Integer slotDurationMinutes;
    private String workingDays;
    private Double hourlyRate;
}