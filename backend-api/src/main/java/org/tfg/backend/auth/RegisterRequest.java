package org.tfg.backend.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    
    @NotBlank(message = "El nombre es obligatorio")
    private String firstname;

    @NotBlank(message = "El apellido es obligatorio")
    private String lastname;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato del email es incorrecto")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;

    private String role; // "CLIENT" o "WORKSHOP" (opcional en payload ya que el endpoint lo define)

    // Específicos Cliente
    private String nif;
    private String phoneNumber;
    private String address;

    // Específicos Taller
    private String cif;
    private String companyName;
}