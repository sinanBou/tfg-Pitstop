package org.tfg.backend.employee;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para actualizar el perfil del empleado autenticado.
 * Solo permite campos seguros (sin cambio de rol ni contraseña).
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileRequest {
    /**
     * Nombre de pila del empleado.
     */
    private String firstname;

    /**
     * Apellidos del empleado.
     */
    private String lastname;

    /**
     * Dirección de contacto o residencia del empleado.
     */
    private String address;

    /**
     * Número de Identificación Fiscal (NIF) del empleado.
     */
    private String nif;

    /**
     * Teléfono personal o de contacto del empleado.
     */
    private String phoneNumber;
}
