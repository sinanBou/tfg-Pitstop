package org.tfg.backend.workshop;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WorkshopDTO {
    private UUID id;
    private String cif;
    private String companyName;
    private String address;
    private String ownerName;
    private Integer totalEmployees;
    private Integer vehiclesCurrentCount;

    // Campos de horario añadidos
    private LocalTime openTime;
    private LocalTime closeTime;
    private Integer slotDurationMinutes;
    private String workingDays;
}