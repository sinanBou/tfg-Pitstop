package org.tfg.backend.identity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que representa una solicitud para restablecer la contraseña.
 * Contiene el token de verificación y la nueva contraseña elegida por el usuario.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest {

    /**
     * El token de recuperación de contraseña enviado previamente por correo electrónico.
     */
    @NotBlank(message = "El token es obligatorio")
    private String token;

    /**
     * Nueva contraseña elegida por el usuario para su cuenta.
     */
    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String newPassword;
}