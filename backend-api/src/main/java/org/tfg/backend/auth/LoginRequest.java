package org.tfg.backend.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {
    /**
    * Correo electrÃ³nico del usuario que actÃºa como identificador Ãºnico de inicio de sesiÃ³n.
    */
    private String email;
    private String password;
}