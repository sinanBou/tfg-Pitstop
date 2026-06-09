package org.tfg.backend.config;

/**
 * Interfaz que define las operaciones de firma, validación y gestión de tokens de seguridad JWT (Json Web Token).
 */
public interface JwtService {
    /**
     * Genera un token JWT firmado para un usuario específico (username/email).
     *
     * @param username Identificador o email del usuario.
     * @return Token JWT en formato string.
     */
    String generarToken(String username);
}
