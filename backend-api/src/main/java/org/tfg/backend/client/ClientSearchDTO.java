package org.tfg.backend.client;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;

/**
 * DTO simplificado utilizado para representar resultados rápidos en búsquedas o listados generales de clientes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientSearchDTO {
    /**
     * Identificador único del cliente.
     */
    private UUID id;

    /**
     * Nombre de pila del cliente.
     */
    private String firstname;

    /**
     * Apellidos del cliente.
     */
    private String lastname;

    /**
     * Correo electrónico.
     */
    private String email;

    /**
     * Número de Identificación Fiscal (NIF).
     */
    private String nif;

    /**
     * Teléfono de contacto.
     */
    private String phoneNumber;
}
