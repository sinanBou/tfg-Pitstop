package org.tfg.backend.user;

public enum Role {
    WORKSHOP_OWNER,     // Dueño del taller (el que registra la empresa)
    WORKSHOP_MANAGER,   // Administrador (gestiona el taller pero no es el dueño)
    WORKSHOP_STAFF,     // Trabajador/Mecánico
    CLIENT              // Cliente final
}