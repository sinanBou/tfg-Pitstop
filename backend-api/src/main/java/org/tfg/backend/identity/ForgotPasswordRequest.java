package org.tfg.backend.identity;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que representa una solicitud de recuperación de contraseña.
 * Contiene el correo electrónico del usuario al que se le enviará el enlace de restablecimiento.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordRequest {

    /**
     * Dirección de correo electrónico del usuario que solicita restablecer su contraseña.
     */
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Formato de email no válido")
    private String email;
}
