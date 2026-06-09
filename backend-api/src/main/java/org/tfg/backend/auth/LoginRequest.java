package org.tfg.backend.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Objeto de solicitud para las credenciales de inicio de sesión de un usuario.
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
     * Contraseña del usuario en formato texto plano (encriptada antes de validar en el backend).
     */
    private String password;
}