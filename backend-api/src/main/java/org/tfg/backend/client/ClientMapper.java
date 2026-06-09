package org.tfg.backend.client;

import org.springframework.stereotype.Component;

@Component
public class ClientMapper {

    /**
    * Transforma una entidad {@link Client} a un DTO de informaciÃ³n completa {@link ClientDTO}.
    *
    * @param client Entidad cliente de origen.
    * @return DTO completo del cliente o null si la entidad es nula.
    */
    public ClientDTO mapToDTO(Client client) {
        if (client == null) return null;
        return ClientDTO.builder()
                .id(client.getId())
                .firstname(client.getUser().getFirstname())
                .lastname(client.getUser().getLastname())
                .email(client.getUser().getEmail())
                .nif(client.getNif())
                .phoneNumber(client.getPhoneNumber())
                .address(client.getAddress())
                .build();
    }

    /**
    * Transforma una entidad {@link Client} a un DTO simplificado para listados y bÃºsquedas rÃ¡pidas {@link ClientSearchDTO}.
    *
    * @param client Entidad cliente de origen.
    * @return DTO de bÃºsqueda rÃ¡pida o null si la entidad es nula.
    */
    public ClientSearchDTO mapToSearchDTO(Client client) {
        if (client == null) return null;
        return ClientSearchDTO.builder()
                .id(client.getId())
                .firstname(client.getUser().getFirstname())
                .lastname(client.getUser().getLastname())
                .email(client.getUser().getEmail())
                .nif(client.getNif())
                .phoneNumber(client.getPhoneNumber())
                .build();
    }
}