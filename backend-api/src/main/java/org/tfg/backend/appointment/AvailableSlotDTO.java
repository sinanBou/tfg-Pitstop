package org.tfg.backend.appointment;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalTime;

/**
 * DTO que representa un slot de tiempo y su disponibilidad operativa dentro de un taller
 * para la programación de nuevas citas.
 */
@Data
@AllArgsConstructor
public class AvailableSlotDTO {
    /**
    * Hora de inicio del intervalo disponible.
    */
    private LocalTime time;
    private boolean available;
}