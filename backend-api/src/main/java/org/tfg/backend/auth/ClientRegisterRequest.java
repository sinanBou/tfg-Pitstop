package org.tfg.backend.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO para el registro de un nuevo cliente (Client).
 * Incluye la validación de entrada para los campos obligatorios del perfil y de la cuenta.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClientRegisterRequest {
    
    @NotBlank(message = "El nombre es obligatorio")
    private String firstname;

    @NotBlank(message = "El apellido es obligatorio")
    private String lastname;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato del email es incorrecto")
    private String email;

    /**
    * Contraseña elegida por el cliente para el inicio de sesión. Mínimo de 6 caracteres.
    */
    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;

    @NotBlank(message = "El NIF es obligatorio")
    private String nif;

    /**
    * Teléfono móvil o fijo de contacto del cliente. Obligatorio.
    */
    @NotBlank(message = "El teléfono es obligatorio")
    private String phoneNumber;

    /**
     * Dirección postal o residencial del cliente (opcional).
     */
    private String address;
}