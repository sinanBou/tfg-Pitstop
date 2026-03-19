package org.tfg.backend.employee;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.tfg.backend.user.Role;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AddEmployeeRequest {
    private String firstname;
    private String lastname;
    private String email;
    private String password;
    private Role role; // Permite mandar "WORKSHOP_STAFF" o "WORKSHOP_MANAGER"
}
