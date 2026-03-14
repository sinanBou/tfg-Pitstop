package org.tfg.backend.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    // Comunes
    private String firstname;
    private String lastname;
    private String email;
    private String password;
    private String role; // "CLIENT" o "WORKSHOP"

    // Específicos Cliente
    private String nif;
    private String phoneNumber;
    private String address;

    // Específicos Taller
    private String cif;
    private String companyName;
    // Usaremos 'firstname' como nombre del taller si es rol WORKSHOP
}