package org.tfg.backend.identity;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que representa una solicitud de inicio de sesión o registro a través de Google OAuth2.
 * Contiene el token ID emitido por Google para verificar la identidad del usuario.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleLoginRequest {

    /**
     * El token ID de Google recibido del cliente tras la autenticación.
     */
    @NotBlank(message = "El token ID de Google es obligatorio")
    private String idToken;
}
