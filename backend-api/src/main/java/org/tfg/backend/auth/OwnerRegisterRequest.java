package org.tfg.backend.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Solicitud de registro con los datos requeridos para dar de alta a un nuevo Propietario de Taller (Owner) en Pitstop.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OwnerRegisterRequest {

    /**
     * Nombre de pila del propietario. Obligatorio.
     */
    @NotBlank(message = "El nombre es obligatorio")
    private String firstname;

    /**
     * Apellidos del propietario. Obligatorio.
     */
    @NotBlank(message = "El apellido es obligatorio")
    private String lastname;

    /**
     * Correo electrónico único del propietario. Obligatorio y con formato de email válido.
     */
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato del email es incorrecto")
    private String email;

    /**
     * Contraseña elegida por el propietario para acceder a la aplicación. Mínimo de 6 caracteres.
     */
    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;

    /**
     * Número de Identificación Fiscal (NIF/CIF) del propietario. Obligatorio.
     */
    @NotBlank(message = "El NIF es obligatorio")
    private String nif;

    /**
     * Teléfono móvil o fijo del propietario. Obligatorio.
     */
    @NotBlank(message = "El teléfono es obligatorio")
    private String phoneNumber;

    /**
     * Dirección de contacto o comercial del propietario (opcional).
     */
    private String address;
}

