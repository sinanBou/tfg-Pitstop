package org.tfg.backend.employee;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.tfg.backend.user.Role;

/**
 * Solicitud para el registro de un nuevo empleado en el sistema por parte del administrador.
 * Define los campos obligatorios del perfil y las credenciales iniciales.
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
    private String lastname;
    private String email;
    private String password;
    private Role role; // Permite mandar "WORKSHOP_STAFF" o "WORKSHOP_MANAGER"
    /**
     * Dirección postal o residencial del empleado.
     */
    private String address;
}