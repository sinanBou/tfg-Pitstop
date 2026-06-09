package org.tfg.backend.user;

/**
 * Enumerado que especifica el proveedor de autenticación utilizado por el usuario.
 * Define si el inicio de sesión es local o se realiza mediante Google OAuth2.
 */
public enum AuthProvider {
    /** Autenticación local mediante correo y contraseña. */
    LOCAL,
    /** Autenticación integrada a través de Google. */
    GOOGLE
}
