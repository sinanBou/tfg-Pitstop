package org.tfg.backend.client;

import org.springframework.stereotype.Component;

@Component
public class ClientMapper {

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
