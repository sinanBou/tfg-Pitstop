package org.tfg.backend.user;

/**
* Enumerado que define los roles de seguridad y acceso autorizados en el sistema.
*/
public enum Role {
    WORKSHOP_OWNER,     // Dueño del taller (el que registra la empresa)
    WORKSHOP_MANAGER,   // Administrador (gestiona el taller pero no es el dueño)
    WORKSHOP_STAFF,     // Trabajador/Mecánico
    CLIENT              // Cliente final
}