package org.tfg.backend.user;

/**
 * Enumerado que define los roles de seguridad y acceso autorizados en el sistema.
 */
public enum Role {
    /** Dueño o propietario de la empresa que registró el taller. */
    WORKSHOP_OWNER,
    /** Administrador o gerente del taller (sin privilegios de dueño). */
    WORKSHOP_MANAGER,
    /** Trabajador técnico o mecánico de la plantilla del taller. */
    WORKSHOP_STAFF,
    /** Cliente final que solicita y gestiona citas de reparación. */
    CLIENT
}