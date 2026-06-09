package org.tfg.backend.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Objeto de respuesta DTO para el inicio de sesión exitoso.
 * Contiene el token JWT firmado y el rol asignado al usuario.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    /**
     * Token JWT (Json Web Token) generado para autorizar las solicitudes HTTP subsiguientes.
     */
    private String token;

    /**
     * Rol asignado del usuario autenticado (ej: CLIENT, WORKSHOP_OWNER).
     */
    private String role;
}