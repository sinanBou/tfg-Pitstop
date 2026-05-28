package org.tfg.backend.auth;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuth2GoogleService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Data
    @Builder
    public static class GoogleUserInfo {
        private String googleId;
        private String email;
        private String firstname;
        private String lastname;
    }

    public GoogleUserInfo validateToken(String idToken) {
        String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
        
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                
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
