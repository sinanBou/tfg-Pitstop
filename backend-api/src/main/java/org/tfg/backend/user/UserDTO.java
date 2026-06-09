package org.tfg.backend.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

/**
 * DTO para la transferencia de información básica de un usuario.
 * Facilita el transporte seguro de IDs de perfiles asociados (cliente, empleado, taller).
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private UUID id;
    private String firstname;
    private String lastname;
    private String email;
    private String role;

    /** Identificador del perfil de cliente asociado, si aplica. */
    private UUID clientId;

    /** Identificador del perfil de empleado asociado, si aplica. */
    private UUID employeeId;

    /** Identificador del taller asociado, si el usuario es dueño o empleado. */
    private UUID workshopId;
}