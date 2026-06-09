package org.tfg.backend.employee;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

/**
 * Petición básica de vinculación de empleado.
 * Contiene los identificadores de usuario y de taller para su asociación.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeRequest {
    /**
     * Identificador único del usuario que se asociará al empleado.
     */
    private UUID userId;

    /**
     * Identificador único del taller en el que se ubicará al empleado.
     */
    private UUID workshopId;
}