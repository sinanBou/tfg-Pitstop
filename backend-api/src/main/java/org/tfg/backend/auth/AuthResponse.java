package org.tfg.backend.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Objeto de respuesta que devuelve el backend tras una autenticación exitosa.
 * Contiene el token JWT generado y el rol asignado al usuario.
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
     * Rol asociado al usuario autenticado (por ejemplo: CLIENT, WORKSHOP_OWNER, etc.).
     */
    private String role;
}