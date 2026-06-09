package org.tfg.backend.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

/**
 * DTO detallado de cliente que unifica la información de contacto personal y de perfil de usuario.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClientDTO {
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
     * Correo electrónico de contacto y sesión del cliente.
     */
    private String email;

    /**
     * Número de Identificación Fiscal (NIF) del cliente.
     */
    private String nif;

    /**
     * Teléfono de contacto.
     */
    private String phoneNumber;

    /**
     * Dirección postal o residencial.
     */
    private String address;

    /**
     * URL de la imagen de perfil del cliente almacenada en el sistema.
     */
    private String profilePictureUrl;
}