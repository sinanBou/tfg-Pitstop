package org.tfg.backend.identity;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

/**
 * Servicio para validar tokens de Google OAuth2.
 * Realiza llamadas contra los servidores de autenticación de Google para validar la identidad de los usuarios.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OAuth2GoogleService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    /**
     * Clase estática para encapsular los detalles del perfil del usuario recuperados de Google.
     */
    @Data
    @Builder
    public static class GoogleUserInfo {
        /**
         * Identificador único de Google (sub).
         */
        private String googleId;

        /**
         * Correo electrónico asociado a la cuenta de Google.
         */
        private String email;

        /**
         * Nombre del usuario.
         */
        private String firstname;

        /**
         * Apellidos del usuario.
         */
        private String lastname;
    }

    /**
     * Valida un ID Token recibido desde Google utilizando la API pública oauth2.googleapis.com.
     * Verifica la validez del token, la coincidencia del Client ID asignado y el estado de verificación del email.
     *
     * @param idToken Token de identidad en formato JWT proporcionado por Google.
     * @return Perfil de información del usuario obtenido si la validación es exitosa.
     * @throws ResponseStatusException Si la validación falla (token inválido, mala audiencia, etc.).
     */
    public GoogleUserInfo validateToken(String idToken) {
        String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
        
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                
                String aud = (String) body.get("aud");
                if (aud == null || !aud.equals(googleClientId)) {
                    log.error("Google Token validation failed: aud claim '{}' does not match configured client id '{}'", aud, googleClientId);
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "El token de Google no pertenece a esta aplicación.");
                }

                String email = (String) body.get("email");
                String googleId = (String) body.get("sub");
                String firstname = (String) body.get("given_name");
                String lastname = (String) body.get("family_name");
                String emailVerified = (String) body.get("email_verified");

                if (!"true".equalsIgnoreCase(emailVerified)) {
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "El correo de Google no está verificado.");
                }

                return GoogleUserInfo.builder()
                        .googleId(googleId)
                        .email(email)
                        .firstname(firstname != null ? firstname : "")
                        .lastname(lastname != null ? lastname : "")
                        .build();
            } else {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token de Google no válido.");
            }
        } catch (Exception e) {
            log.error("Error al validar el token de Google: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Fallo en la autenticación con Google: " + e.getMessage());
        }
    }
}