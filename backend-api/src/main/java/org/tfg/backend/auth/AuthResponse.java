package org.tfg.backend.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    /**
    * Token JWT (Json Web Token) generado para autorizar las solicitudes HTTP subsiguientes.
    */
    private String token;
    private String role;
}