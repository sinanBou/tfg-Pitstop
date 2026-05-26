package org.tfg.backend.employee;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeDTO {
    private UUID id;
    private String firstname;
    private String lastname;
    private String email;
    private String role;
    private String workshopName;
    private UUID workshopId;
    private String address;
    private String allowedSections;
    private String profilePictureUrl;
}