package org.tfg.backend.user;

/**
* Enumerado que especifica el proveedor de autenticaciÃ³n utilizado por el usuario.
* Define si el inicio de sesiÃ³n es local o se realiza mediante Google OAuth2.
*/
public enum AuthProvider {
    LOCAL,
    GOOGLE
}