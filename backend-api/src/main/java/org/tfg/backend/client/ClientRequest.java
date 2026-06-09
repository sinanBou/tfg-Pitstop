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
public class ClientRequest {
    /**
    * Nuevo NIF a actualizar para el cliente.
    */
    private String nif;
    private String phoneNumber;
    private String address;
}