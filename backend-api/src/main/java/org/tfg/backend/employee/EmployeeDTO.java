package org.tfg.backend.employee;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

/**
 * Objeto de transferencia de datos (DTO) para representar la información de un empleado.
 * Consolida los campos del usuario de seguridad y la entidad Employee.
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
    private String firstname;
    private String lastname;
    private String email;
    private String role;
    /**
    * Nombre de la empresa o taller asociado.
    */
    private String workshopName;
    private UUID workshopId;
    private String address;
    private String allowedSections;
    private String profilePictureUrl;
    /**
    * NIF del empleado.
    */
    private String nif;
    private String phoneNumber;
}