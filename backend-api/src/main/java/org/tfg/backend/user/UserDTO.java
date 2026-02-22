package org.tfg.backend.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private UUID id;
    private String firstname;
    private String lastname;
    private String email;
    private String role;
    private UUID clientId;    // ID de perfil de cliente si existe
    private UUID employeeId;  // ID de perfil de empleado si existe
}