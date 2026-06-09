package org.tfg.backend.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la petición de cambio de contraseña dentro del panel del usuario.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordRequest {

    /** Contraseña actual del usuario (puede ser nula si la cuenta se registró con Google). */
    @NotBlank(message = "La contraseña actual es obligatoria")
    private String currentPassword;

    /** Nueva contraseña de seguridad elegida por el usuario. */
    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Size(min = 6, message = "La nueva contraseña debe tener al menos 6 caracteres")
    private String newPassword;
}
