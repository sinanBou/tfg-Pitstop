package org.tfg.backend.identity;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la petición de inicio de sesión mediante Google OAuth2.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleLoginRequest {

    /**
     * Token ID de Google provisto por el frontend tras una autenticación exitosa.
     */
    @NotBlank(message = "El token ID de Google es obligatorio")
    private String idToken;
}
