package org.tfg.backend.client;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientSearchDTO {
    private UUID id;
    private String firstname;
    private String lastname;
    private String email;
    private String nif;
    private String phoneNumber;
}
