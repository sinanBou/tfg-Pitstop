package org.tfg.backend.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Objeto de petición para la creación o modificación parcial de información
 * básica del usuario (nombre, apellidos y correo electrónico).
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
    private String lastname;
    private String email;
}