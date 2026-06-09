package org.tfg.backend.employee;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

/**
 * Solicitud interna para asociar un usuario existente con un taller como empleado.
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
    private UUID workshopId;
}