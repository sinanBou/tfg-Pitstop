package org.tfg.backend.employee;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.tfg.backend.user.Role;

/**
 * Petición para registrar y añadir un nuevo empleado a la plantilla de un taller.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AddEmployeeRequest {
    /**
     * Nombre de pila del nuevo empleado.
     */
    private String firstname;

    /**
     * Apellidos del nuevo empleado.
     */
    private String lastname;

    /**
     * Correo electrónico corporativo o personal del nuevo empleado.
     */
    private String email;

    /**
     * Contraseña temporal o inicial de acceso asignada al nuevo empleado.
     */
    private String password;

    /**
     * Rol que desempeñará dentro de la organización del taller.
     * Permite especificar {@link Role#WORKSHOP_STAFF} o {@link Role#WORKSHOP_MANAGER}.
     */
    private Role role;

    /**
     * Dirección postal o residencial de residencia del empleado.
     */
    private String address;
}
