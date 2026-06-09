package org.tfg.backend.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Petición básica de creación o edición de los datos de un usuario.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserRequest {
    /**
     * Nombre de pila del usuario.
     */
    private String firstname;

    /**
     * Apellidos del usuario.
     */
    private String lastname;

    /**
     * Dirección de correo electrónico de contacto.
     */
    private String email;
}