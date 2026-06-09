package org.tfg.backend.employee;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

/**
 * DTO para la transferencia de información completa y detallada de un empleado,
 * incluyendo datos del usuario y del taller al que pertenece.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeDTO {
    /**
     * Identificador único del empleado.
     */
    private UUID id;

    /**
     * Nombre de pila del empleado.
     */
    private String firstname;

    /**
     * Apellidos del empleado.
     */
    private String lastname;

    /**
     * Correo electrónico de inicio de sesión y contacto.
     */
    private String email;

    /**
     * Rol que ejerce en el sistema (por ejemplo: WORKSHOP_STAFF, WORKSHOP_MANAGER).
     */
    private String role;

    /**
     * Nombre de la empresa o taller asociado.
     */
    private String workshopName;

    /**
     * Identificador único del taller asociado.
     */
    private UUID workshopId;

    /**
     * Dirección postal del empleado.
     */
    private String address;

    /**
     * Secciones autorizadas dentro del panel del taller.
     */
    private String allowedSections;

    /**
     * URL de la imagen de perfil del empleado.
     */
    private String profilePictureUrl;

    /**
     * NIF del empleado.
     */
    private String nif;

    /**
     * Teléfono de contacto del empleado.
     */
    private String phoneNumber;
}