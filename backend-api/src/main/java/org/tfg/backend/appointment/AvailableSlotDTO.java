package org.tfg.backend.appointment;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalTime;

@Data
@AllArgsConstructor
public class AvailableSlotDTO {
    private LocalTime time;
    private boolean available;
}