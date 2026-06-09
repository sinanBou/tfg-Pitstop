package org.tfg.backend.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO para el inicio de sesión.
 * Contiene el correo electrónico identificador y la contraseña.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {
    /**
     * Correo electrónico del usuario que actúa como identificador único de inicio de sesión.
     */
    private String email;

    /**
     * Contraseña del usuario asociada a la cuenta.
     */
    private String password;
}