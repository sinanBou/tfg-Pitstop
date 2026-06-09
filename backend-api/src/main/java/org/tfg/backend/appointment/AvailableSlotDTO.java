package org.tfg.backend.appointment;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalTime;

/**
 * DTO que representa un intervalo o hueco horario disponible en la agenda de un taller.
 */
@Data
@AllArgsConstructor
public class AvailableSlotDTO {
    /**
     * Hora de inicio del intervalo disponible.
     */
    private LocalTime time;

    /**
     * Indica si el intervalo horario se encuentra libre y disponible para asignación.
     */
    private boolean available;
}