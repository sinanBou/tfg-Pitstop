package org.tfg.backend.config;

/**
 * Interfaz que define las operaciones de firma, validación y gestión de tokens de seguridad JWT (Json Web Token).
 */
public interface JwtService {
    /**
     * Genera un token JWT para el nombre de usuario (email) especificado.
     *
     * @param username Identificador o email del usuario.
     * @return El token JWT generado en formato String.
     */
    String generarToken(String username);
}