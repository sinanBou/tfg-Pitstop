package org.tfg.backend.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

/**
 * Objeto de solicitud para actualizar la información de contacto o fiscal de un cliente existente.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClientRequest {
    /**
     * Nuevo NIF a actualizar para el cliente.
     */
    private String nif;

    /**
     * Nuevo número de teléfono de contacto.
     */
    private String phoneNumber;

    /**
     * Nueva dirección de residencia.
     */
    private String address;
}