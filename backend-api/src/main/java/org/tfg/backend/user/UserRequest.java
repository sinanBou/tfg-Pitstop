package org.tfg.backend.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserRequest {
    /**
    * Nombre de pila del usuario.
    */
    private String firstname;
    private String lastname;
    private String email;
}