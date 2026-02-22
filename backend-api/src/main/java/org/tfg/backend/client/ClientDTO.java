package org.tfg.backend.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClientDTO {
    private UUID id;
    private String firstname;
    private String lastname;
    private String email;
    private String nif;
    private String phoneNumber;
    private String address;
}